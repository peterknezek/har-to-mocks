import path from 'node:path';

import type { Entry } from '../../../types/index.js';
import { OutputFormat } from '../../../types/index.js';
import { entryToFilePath } from '../../write-mocks/utils/process-data.js';

export interface EntryWithWriteStatus {
  entry: Entry;
  willBeWritten: boolean;
}

/**
 * Creates a unique key for an entry: the file it is written to
 * (path/METHOD.json, or host/path?query for Chrome overrides).
 */
const getEntryKey = (entry: Entry, targetPath: string, format: OutputFormat): string => {
  const { filePath, fileName } = entryToFilePath(entry, targetPath, format);
  return path.join(filePath, fileName);
};

/**
 * Marks entries with their write status.
 * When multiple entries would write to the same file,
 * only the last one in the list will be marked as "willBeWritten: true".
 *
 * @param entries - Array of HAR entries
 * @param targetPath - The target directory path
 * @param format - Folder layout of the mock files
 * @returns Array of entries with their write status
 */
export const markDuplicates = (
  entries: Entry[],
  targetPath = '',
  format = OutputFormat.mocks,
): EntryWithWriteStatus[] => {
  // First pass: find the last index for each unique key
  const lastIndexByKey = new Map<string, number>();

  entries.forEach((entry, index) => {
    const key = getEntryKey(entry, targetPath, format);
    lastIndexByKey.set(key, index);
  });

  // Second pass: mark each entry with its write status
  return entries.map((entry, index) => {
    const key = getEntryKey(entry, targetPath, format);
    const willBeWritten = lastIndexByKey.get(key) === index;
    return { entry, willBeWritten };
  });
};
