import { URL } from 'node:url';

import type { Entry } from '../../../types/index.js';

export interface EntryWithWriteStatus {
  entry: Entry;
  willBeWritten: boolean;
}

/**
 * Creates a unique key for an entry based on its path and method.
 * This matches how files are written (path/METHOD.json).
 */
const getEntryKey = (entry: Entry): string => {
  const parsedUrl = new URL(entry.request.url);
  return `${parsedUrl.pathname}:${entry.request.method}`;
};

/**
 * Marks entries with their write status.
 * When multiple entries have the same path+method (would write to same file),
 * only the last one in the list will be marked as "willBeWritten: true".
 *
 * @param entries - Array of HAR entries
 * @returns Array of entries with their write status
 */
export const markDuplicates = (entries: Entry[]): EntryWithWriteStatus[] => {
  // First pass: find the last index for each unique key
  const lastIndexByKey = new Map<string, number>();

  entries.forEach((entry, index) => {
    const key = getEntryKey(entry);
    lastIndexByKey.set(key, index);
  });

  // Second pass: mark each entry with its write status
  return entries.map((entry, index) => {
    const key = getEntryKey(entry);
    const willBeWritten = lastIndexByKey.get(key) === index;
    return { entry, willBeWritten };
  });
};
