import { URL } from 'node:url';

import { confirm } from '@inquirer/prompts';

import type { Entry } from '../../types/index.js';
import type { EntryWithWriteStatus } from '../result-table/utils/index.js';
import { markDuplicates } from '../result-table/utils/index.js';
import { checkboxWithPreview, type ChoiceWithPreview } from './checkbox-with-preview.js';

/**
 * Formats an entry for display in the selection list.
 */
const formatEntryForDisplay = (entry: Entry): string => {
  const parsedUrl = new URL(entry.request.url);
  const query = parsedUrl.search ? ` ${parsedUrl.search}` : '';
  return `${entry.request.method} ${parsedUrl.pathname}${query}`;
};

/**
 * Extracts the response text from an entry for preview.
 */
const getResponseText = (entry: Entry): string | undefined => {
  return entry.response.content.text;
};

/**
 * Creates choices for the checkbox prompt from entries.
 * Pre-selects entries that would be written by default (last occurrence of each path+method).
 * Includes response preview data for each choice.
 */
const createChoices = (entriesWithStatus: EntryWithWriteStatus[]): ChoiceWithPreview<number>[] => {
  return entriesWithStatus.map((entryWithStatus, index) => ({
    name: formatEntryForDisplay(entryWithStatus.entry),
    value: index,
    checked: entryWithStatus.willBeWritten,
    responsePreview: getResponseText(entryWithStatus.entry),
  }));
};

/**
 * Prompts the user to select which endpoints to write using interactive checkboxes.
 * Shows a preview of the response JSON for the currently focused entry.
 * Returns the selected entries.
 *
 * @param entries - Array of HAR entries to select from
 * @returns Selected entries or null if user cancels
 */
export const interactiveSelect = async (entries: Entry[]): Promise<Entry[] | null> => {
  if (entries.length === 0) {
    return [];
  }

  const entriesWithStatus = markDuplicates(entries);
  const choices = createChoices(entriesWithStatus);

  const selectedIndices = await checkboxWithPreview<number>({
    message: 'Select endpoints to write:',
    choices,
    pageSize: 10,
    previewMaxLines: 12,
  });

  if (selectedIndices.length === 0) {
    return null;
  }

  // Return selected entries in their original order
  return selectedIndices.sort((a, b) => a - b).map((index) => entries[index]);
};

/**
 * Prompts the user to confirm writing the files.
 *
 * @param fileCount - Number of files to write
 * @returns True if user confirms, false otherwise
 */
export const confirmWrite = async (fileCount: number): Promise<boolean> => {
  return confirm({
    message: `Write ${fileCount} file(s)?`,
    default: true,
  });
};
