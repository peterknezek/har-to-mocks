import { makeTable } from '@oclif/table';

import type { Entry, Logger } from '../../types/index.js';
import { extractToColumns } from './utils/index.js';

/**
 * Log table with content to the console. Table with columns:
 * [`Name` (last part of path), `Method` (regest method), `Path` (path of reguest)]
 * @param data filtered Entry form .har
 * @param log method to print to the console
 */
export const resultTable = (data: Entry[], log: Logger) => {
  const tableString = makeTable({
    data: data.map(extractToColumns) as Record<string, unknown>[],
    columns: [
      { key: 'name', name: 'Name' },
      { key: 'method', name: 'Method' },
      { key: 'path', name: 'Path' },
    ],
  });

  log(tableString);
};
