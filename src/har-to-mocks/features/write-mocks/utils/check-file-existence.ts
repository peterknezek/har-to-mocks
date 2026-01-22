import { existsSync } from 'node:fs';
import path from 'node:path';

import type { Entry } from '../../../types/index.js';
import { entrysToPathsWithData } from './process-data.js';

export interface FileExistenceMap {
  /** Map of full file path to existence status */
  exists: Map<string, boolean>;
  /** Quick check if any files exist */
  hasExistingFiles: boolean;
}

/**
 * Checks which files already exist on the filesystem.
 * Called once and the result is shared between table and tree display.
 *
 * @param targetPath - The target directory path
 * @param data - Array of HAR entries
 * @returns Map of file paths to existence status
 */
export const checkFileExistence = (targetPath: string, data: Entry[]): FileExistenceMap => {
  const newFiles = entrysToPathsWithData(data, targetPath);
  const exists = new Map<string, boolean>();
  let hasExistingFiles = false;

  newFiles.forEach(({ filePath, fileName }) => {
    const fullPath = path.join(filePath, fileName);
    const fileExists = existsSync(fullPath);
    exists.set(fullPath, fileExists);
    if (fileExists) {
      hasExistingFiles = true;
    }
  });

  return { exists, hasExistingFiles };
};
