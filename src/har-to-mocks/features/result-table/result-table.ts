import path from 'node:path';

import type { Entry, Logger } from '../../types/index.js';
import { OutputFormat } from '../../types/index.js';
import type { FileExistenceMap } from '../write-mocks/utils/check-file-existence.js';
import { entrysToPathsWithData } from '../write-mocks/utils/process-data.js';
import { makeSimpleTable } from './simple-table.js';
import { extractToColumns, extractToColumnsWithFileStatus, markDuplicates } from './utils/index.js';

const numbersFrom1 = (data: Entry[]) => data.map((_, index) => index + 1);

/**
 * Log table with content to the console. Table with columns:
 * [`#` (row number for --select), `Name` (last part of path), `Method` (request method), `Path` (path of request), `Query` (query string)]
 * Used when no target path is provided (just inspecting HAR file).
 * @param data filtered Entry from .har
 * @param log method to print to the console
 * @param rowNumbers numbers shown in the `#` column, 1 to n by default
 */
export const resultTable = (data: Entry[], log: Logger, rowNumbers = numbersFrom1(data)) => {
  const tableString = makeSimpleTable({
    data: data.map((entry, index) => ({ number: rowNumbers[index], ...extractToColumns(entry) })),
    columns: [
      { key: 'number', name: '#' },
      { key: 'name', name: 'Name' },
      { key: 'method', name: 'Method' },
      { key: 'path', name: 'Path' },
      { key: 'query', name: 'Query' },
    ],
  });

  log(tableString);
};

/**
 * Log table with content and file status to the console. Table with columns:
 * [`#`, `Name`, `Method`, `Path`, `Query`, `Status` (create/update/skip)]
 * Used when target path is provided to show what will happen to each file.
 * @param data filtered Entry from .har
 * @param targetPath path where mocks will be written
 * @param existenceMap map of file paths to existence status
 * @param log method to print to the console
 * @param format folder layout of the mock files
 * @param rowNumbers numbers shown in the `#` column, 1 to n by default
 */
export const resultTableWithFileStatus = (
  data: Entry[],
  targetPath: string,
  existenceMap: FileExistenceMap,
  log: Logger,
  format = OutputFormat.mocks,
  rowNumbers = numbersFrom1(data),
) => {
  const entriesWithStatus = markDuplicates(data, targetPath, format);
  const pathsData = entrysToPathsWithData(data, targetPath, format);

  const tableData = entriesWithStatus.map((entryWithStatus, index) => {
    const { filePath, fileName } = pathsData[index];
    const fullPath = path.join(filePath, fileName);
    const fileExists = existenceMap.exists.get(fullPath) ?? false;
    return { number: rowNumbers[index], ...extractToColumnsWithFileStatus(entryWithStatus, fileExists) };
  });

  const tableString = makeSimpleTable({
    data: tableData,
    columns: [
      { key: 'number', name: '#' },
      { key: 'name', name: 'Name' },
      { key: 'method', name: 'Method' },
      { key: 'path', name: 'Path' },
      { key: 'query', name: 'Query' },
      { key: 'status', name: 'Status' },
    ],
  });

  log(tableString);

  // Check if there are any duplicates (entries that will be skipped)
  const hasDuplicates = entriesWithStatus.some((entry) => !entry.willBeWritten);
  if (hasDuplicates) {
    const sharedBy = format === OutputFormat.chromeOverrides ? 'URL' : 'path and method';
    log(`\nNote: Some endpoints have status "skip" because they share the same ${sharedBy}.`);
    log('The last occurrence will be written. To select specific endpoints, use --select or interactive mode:');
    log('\n  har-to-mocks <file.har> <output-folder> --select=1,3');
    log('  har-to-mocks <file.har> <output-folder> --interactive\n');
  }
};
