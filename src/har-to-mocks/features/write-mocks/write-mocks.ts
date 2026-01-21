import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { ux } from '@oclif/core';

import type { Entry, Logger } from '../../types/index.js';
import { folderTree } from '../folder-tree/index.js';
import { entrysToPathsWithData } from './utils/index.js';

interface Options {
  isDryRun: boolean;
}

export const writeMocks = (targetPath: string, data: Entry[], log: Logger, options: Options): void => {
  const newFiles = entrysToPathsWithData(data, targetPath);
  log('\nFolder tree which will be applied:\n');
  folderTree(newFiles.map(({ filePath, fileName }) => path.join(filePath, fileName)));

  if (options.isDryRun) {
    log('\nNo files were written. If you want to write files remove the (--dry-run) flag.');
  } else {
    ux.action.start('\nwriting files');
    newFiles.forEach(({ filePath, fileName, fileData }) => {
      mkdirSync(filePath, { recursive: true });
      writeFileSync(path.join(filePath, fileName), fileData);
    });
    ux.action.stop();
  }
};
