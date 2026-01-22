import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { ux } from '@oclif/core';

import type { Entry, Logger } from '../../types/index.js';
import { folderTree } from '../folder-tree/index.js';
import { entrysToPathsWithData } from './utils/index.js';

interface Options {
  isDryRun: boolean;
}

/**
 * Shows a preview of the folder tree that will be created.
 * Does not write any files.
 *
 * @param targetPath - The target directory path
 * @param data - Array of HAR entries
 * @param log - Logger function
 * @returns Number of files that would be written
 */
export const previewMocks = (targetPath: string, data: Entry[], log: Logger): number => {
  const newFiles = entrysToPathsWithData(data, targetPath);
  log('\nFolder tree which will be applied:\n');
  folderTree(newFiles.map(({ filePath, fileName }) => path.join(filePath, fileName)));
  return newFiles.length;
};

/**
 * Writes the mock files to disk.
 * Call previewMocks first if you want to show the user what will be created.
 *
 * @param targetPath - The target directory path
 * @param data - Array of HAR entries
 * @param log - Logger function
 */
export const executeWriteMocks = (targetPath: string, data: Entry[], log: Logger): void => {
  const newFiles = entrysToPathsWithData(data, targetPath);

  ux.action.start('\nwriting files');
  const errors: Array<{ file: string; error: string }> = [];
  let successCount = 0;

  newFiles.forEach(({ filePath, fileName, fileData }) => {
    const fullPath = path.join(filePath, fileName);
    try {
      mkdirSync(filePath, { recursive: true });
      writeFileSync(fullPath, fileData);
      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as NodeJS.ErrnoException).code;

      let userFriendlyMessage = errorMessage;
      if (errorCode === 'ENAMETOOLONG') {
        userFriendlyMessage = `Path exceeds maximum length (${fullPath.length} characters)`;
      } else if (errorCode === 'EACCES' || errorCode === 'EPERM') {
        userFriendlyMessage = 'Permission denied';
      } else if (errorCode === 'ENOSPC') {
        userFriendlyMessage = 'No space left on device';
      }

      errors.push({ file: fullPath, error: userFriendlyMessage });
    }
  });

  ux.action.stop();

  // Report results
  if (successCount > 0) {
    log(`\n✓ Successfully wrote ${successCount} file(s)`);
  }

  if (errors.length > 0) {
    log(`\n✗ Failed to write ${errors.length} file(s):`);
    errors.forEach(({ file, error }) => {
      log(`  - ${file}`);
      log(`    Error: ${error}`);
    });

    // Throw an error to signal that some files failed to write
    // This will be caught by oclif's error handler
    const errorMsg = `Failed to write ${errors.length} out of ${newFiles.length} file(s)`;
    const err = new Error(errorMsg) as Error & { code: string };
    err.code = 'WRITE_MOCKS_PARTIAL_FAILURE';
    throw err;
  }
};

export const writeMocks = (targetPath: string, data: Entry[], log: Logger, options: Options): void => {
  previewMocks(targetPath, data, log);

  if (options.isDryRun) {
    log('\nNo files were written. If you want to write files remove the (--dry-run) flag.');
  } else {
    executeWriteMocks(targetPath, data, log);
  }
};
