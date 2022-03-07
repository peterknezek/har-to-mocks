import { cli, Table } from 'cli-ux';

import type { Entry, Logger } from '../../types';
import { Columns, extractToColumns } from './utils';

const columns: Table.table.Columns<Columns> = {
  name: {
    minWidth: 24,
  },
  method: {
    minWidth: 7,
  },
  path: {
    minWidth: 14,
  },
};

/**
 * Log table with content to the console. Table with columns:
 * [`Name` (last part of path), `Method` (regest method), `Path` (path of reguest)]
 * @param data filtered Entry form .har
 * @param log method to print to the console
 */
export const resultTable = (data: Entry[], log: Logger) => {
  cli.table(data.map(extractToColumns), columns, {
    printLine: log,
  });
};
