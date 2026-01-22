import { URL } from 'node:url';

import type { Entry, Method } from '../../../types/index.js';
import type { EntryWithWriteStatus } from './mark-duplicates.js';

export interface Columns extends Record<string, unknown> {
  name: string;
  method: Method;
  path: string;
  query: string;
}

export interface ColumnsWithStatus extends Columns {
  status: string;
}

export type FileStatus = 'skip' | 'create' | 'update';

export const extractToColumns = (entry: Entry): Columns => {
  const parsedUrl = new URL(entry.request.url);
  const lastPartOfPath = parsedUrl.pathname.split('/').pop() as string;
  return {
    name: lastPartOfPath,
    method: entry.request.method,
    path: parsedUrl.pathname,
    query: parsedUrl.search,
  };
};

export const extractToColumnsWithStatus = (entryWithStatus: EntryWithWriteStatus): ColumnsWithStatus => {
  const columns = extractToColumns(entryWithStatus.entry);
  return {
    ...columns,
    status: entryWithStatus.willBeWritten ? 'write' : 'skip',
  };
};

/**
 * Extract columns with file status (create/update/skip) based on file existence.
 */
export const extractToColumnsWithFileStatus = (
  entryWithStatus: EntryWithWriteStatus,
  fileExists: boolean,
): ColumnsWithStatus => {
  const columns = extractToColumns(entryWithStatus.entry);

  let status: FileStatus;
  if (!entryWithStatus.willBeWritten) {
    status = 'skip';
  } else if (fileExists) {
    status = 'update';
  } else {
    status = 'create';
  }

  return {
    ...columns,
    status,
  };
};
