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
