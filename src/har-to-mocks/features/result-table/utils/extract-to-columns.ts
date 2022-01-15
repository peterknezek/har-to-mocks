import { URL } from 'url';

import type { Entry, Method } from '../../../types';

export interface Columns {
  name: string;
  method: Method;
  path: string;
}

export const extractToColumns = (entry: Entry): Columns => {
  const parsedUrl = new URL(entry.request.url);
  const lastPartOfPath = parsedUrl.pathname.split('/').pop() as string;
  return {
    name: lastPartOfPath,
    method: entry.request.method,
    path: parsedUrl.pathname,
  };
};
