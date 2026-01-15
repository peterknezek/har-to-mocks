import type { Entry, Logger } from '../../types';
import { extractToColumns } from './utils';

/**
 * Log table with content to the console. Table with columns:
 * [`Name` (last part of path), `Method` (regest method), `Path` (path of reguest)]
 * @param data filtered Entry form .har
 * @param log method to print to the console
 */
export const resultTable = async (data: Entry[], log: Logger) => {
  // Dynamic import of @oclif/table (ESM module) from CommonJS
  const { makeTable } = await import('@oclif/table');

  const tableString = makeTable({
    data: data.map(extractToColumns),
    columns: [
      { key: 'name', name: 'Name' },
      { key: 'method', name: 'Method' },
      { key: 'path', name: 'Path' },
    ],
  });

  log(tableString);
};
