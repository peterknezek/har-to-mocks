import type { Entry, Logger } from '../../types/index.js';
import { makeSimpleTable } from './simple-table.js';
import { extractToColumnsWithStatus, markDuplicates } from './utils/index.js';

/**
 * Log table with content to the console. Table with columns:
 * [`Name` (last part of path), `Method` (request method), `Path` (path of request), `Query` (query string), `Status` (write or skip)]
 * @param data filtered Entry from .har
 * @param log method to print to the console
 */
export const resultTable = (data: Entry[], log: Logger) => {
  const entriesWithStatus = markDuplicates(data);

  const tableString = makeSimpleTable({
    data: entriesWithStatus.map(extractToColumnsWithStatus) as Record<string, unknown>[],
    columns: [
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
    log('\nNote: Some endpoints have status "skip" because they share the same path and method.');
    log('The last occurrence will be written. To select specific endpoints, use interactive mode:');
    log('\n  har-to-mocks <file.har> <output-folder> --interactive\n');
  }
};
