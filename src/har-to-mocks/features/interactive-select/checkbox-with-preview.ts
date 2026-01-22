import { styleText } from 'node:util';

import { cursorHide } from '@inquirer/ansi';
import {
  createPrompt,
  isDownKey,
  isEnterKey,
  isNumberKey,
  isSpaceKey,
  isUpKey,
  makeTheme,
  useKeypress,
  useMemo,
  usePagination,
  usePrefix,
  useState,
} from '@inquirer/core';
import figures from '@inquirer/figures';

import { formatResponsePreview } from '../response-preview/index.js';

type Status = 'idle' | 'done';

type CheckboxTheme = {
  icon: {
    checked: string;
    unchecked: string;
    cursor: string;
  };
  style: {
    disabledChoice: (text: string) => string;
    renderSelectedChoices: (choices: ReadonlyArray<{ name: string }>) => string;
    previewHeader: (text: string) => string;
    previewBorder: (text: string) => string;
  };
};

const checkboxTheme: CheckboxTheme = {
  icon: {
    checked: styleText('green', figures.circleFilled),
    unchecked: figures.circle,
    cursor: figures.pointer,
  },
  style: {
    disabledChoice: (text: string) => styleText('dim', `- ${text}`),
    renderSelectedChoices: (choices: ReadonlyArray<{ name: string }>) =>
      choices.map((choice) => choice.name).join(', '),
    previewHeader: (text: string) => styleText('cyan', text),
    previewBorder: (text: string) => styleText('dim', text),
  },
};

export type ChoiceWithPreview<Value> = {
  name: string;
  value: Value;
  checked?: boolean;
  disabled?: boolean | string;
  responsePreview?: string;
};

type Config<Value> = {
  message: string;
  choices: ReadonlyArray<ChoiceWithPreview<Value>>;
  pageSize?: number;
  previewMaxLines?: number;
};

type Item<Value> = ChoiceWithPreview<Value> & { checked: boolean; index: number };

const isSelectableChoice = <Value>(choice: ChoiceWithPreview<Value>): boolean => {
  return !choice.disabled;
};

const PREVIEW_BORDER = '─'.repeat(50);

/**
 * Custom checkbox prompt with response preview.
 * Shows the JSON response of the currently focused entry below the selection list.
 */
export const checkboxWithPreview = createPrompt(
  <Value>(config: Config<Value>, done: (value: Array<Value>) => void): string => {
    const { pageSize = 15, previewMaxLines = 12 } = config;
    const theme = makeTheme<CheckboxTheme>(checkboxTheme);
    const prefix = usePrefix({ theme });

    const items = useMemo<Item<Value>[]>(
      () =>
        config.choices.map((choice, index) => ({
          ...choice,
          checked: choice.checked ?? false,
          index,
        })),
      [config.choices],
    );

    const [status, setStatus] = useState<Status>('idle');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [checkedItems, setCheckedItems] = useState<Set<number>>(() => {
      const initialChecked = new Set<number>();
      items.forEach((item) => {
        if (item.checked && isSelectableChoice(item)) {
          initialChecked.add(item.index);
        }
      });
      return initialChecked;
    });
    const [errorMessage, setErrorMessage] = useState<string>();

    // Find next selectable item in direction
    const findNextSelectable = (start: number, direction: 1 | -1): number => {
      let pos = start;
      const visited = new Set<number>();
      while (!visited.has(pos)) {
        visited.add(pos);
        pos = (pos + direction + items.length) % items.length;
        if (isSelectableChoice(items[pos])) {
          return pos;
        }
      }
      return start;
    };

    useKeypress((key) => {
      // Clear error on any keypress
      setErrorMessage(undefined);

      if (isEnterKey(key)) {
        const selectedValues = items.filter((item) => checkedItems.has(item.index)).map((item) => item.value);

        setStatus('done');
        done(selectedValues);
        return;
      }

      if (isUpKey(key)) {
        setCursorPosition(findNextSelectable(cursorPosition, -1));
      } else if (isDownKey(key)) {
        setCursorPosition(findNextSelectable(cursorPosition, 1));
      } else if (isSpaceKey(key)) {
        const currentItem = items[cursorPosition];
        if (currentItem && isSelectableChoice(currentItem)) {
          const newChecked = new Set(checkedItems);
          if (newChecked.has(currentItem.index)) {
            newChecked.delete(currentItem.index);
          } else {
            newChecked.add(currentItem.index);
          }
          setCheckedItems(newChecked);
        }
      } else if (key.name === 'a') {
        // Toggle all
        const selectableItems = items.filter(isSelectableChoice);
        const allChecked = selectableItems.every((item) => checkedItems.has(item.index));
        const newChecked = new Set<number>();
        if (!allChecked) {
          selectableItems.forEach((item) => newChecked.add(item.index));
        }
        setCheckedItems(newChecked);
      } else if (key.name === 'i') {
        // Invert selection
        const newChecked = new Set<number>();
        items.forEach((item) => {
          if (isSelectableChoice(item)) {
            if (!checkedItems.has(item.index)) {
              newChecked.add(item.index);
            }
          }
        });
        setCheckedItems(newChecked);
      } else if (isNumberKey(key)) {
        // Jump to numbered choice (1-9)
        const num = Number(key.name) - 1;
        if (num >= 0 && num < items.length && isSelectableChoice(items[num])) {
          setCursorPosition(num);
        }
      }
    });

    // When done, show the selected items summary
    if (status === 'done') {
      const selectedItems = items.filter((item) => checkedItems.has(item.index));
      const answer = theme.style.answer(theme.style.renderSelectedChoices(selectedItems));
      return `${prefix} ${theme.style.message(config.message, status)} ${answer}`;
    }

    // Render the list of choices
    const page = usePagination({
      items,
      active: cursorPosition,
      renderItem: ({ item, isActive }) => {
        const checkbox = checkedItems.has(item.index) ? theme.icon.checked : theme.icon.unchecked;
        const cursor = isActive ? theme.icon.cursor : ' ';

        if (item.disabled) {
          const disabledLabel = typeof item.disabled === 'string' ? item.disabled : '(disabled)';
          return theme.style.disabledChoice(`${cursor} ${checkbox} ${item.name} ${disabledLabel}`);
        }

        const color = isActive ? theme.style.highlight : (x: string) => x;
        return color(`${cursor}${checkbox} ${item.name}`);
      },
      pageSize,
    });

    // Get the currently focused item's response preview
    const focusedItem = items[cursorPosition];
    const responsePreview = formatResponsePreview(focusedItem?.responsePreview, {
      maxLines: previewMaxLines,
    });

    // Build the output
    const message = theme.style.message(config.message, status);

    // Help text with keyboard shortcuts
    const helpText = styleText('dim', '(↑↓ navigate, space select, a toggle all, i invert, ⏎ confirm)');

    // Build preview section
    const previewSection = [
      '',
      theme.style.previewBorder(PREVIEW_BORDER),
      theme.style.previewHeader(' Response Preview '),
      theme.style.previewBorder(PREVIEW_BORDER),
      responsePreview,
    ].join('\n');

    // Combine all parts
    const lines = [
      `${prefix} ${message}`,
      page,
      previewSection,
      '',
      errorMessage ? theme.style.error(errorMessage) : '',
      helpText,
    ]
      .filter(Boolean)
      .join('\n')
      .trimEnd();

    return `${lines}${cursorHide}`;
  },
);
