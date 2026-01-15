import Table from 'cli-table3';

import type { Entry, Logger } from '../../types';
import { Columns, extractToColumns } from './utils';

/**
 * Log table with content to the console. Table with columns:
 * [`Name` (last part of path), `Method` (regest method), `Path` (path of reguest)]
 * @param data filtered Entry form .har
 * @param log method to print to the console
 */
export const resultTable = (data: Entry[], log: Logger) => {
  const table = new Table({
    head: ['Name', 'Method', 'Path'],
    colWidths: [24, 7, 28],
  });

  data.map(extractToColumns).forEach((row) => {
    table.push([row.name, row.method, row.path]);
  });

  log(table.toString());
};
