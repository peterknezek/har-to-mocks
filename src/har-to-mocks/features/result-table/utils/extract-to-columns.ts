import url from 'url'
import {Entry, Method} from '../../../types'

export interface Columns {
    name: string;
    method: Method;
    path: string;
}

export const extractToColumns = (entry: Entry): Columns => {
  const parsedUrl = url.parse(entry.request.url)
  const lastPartOfPath = parsedUrl.pathname?.split('/').pop()
  return {
    name: lastPartOfPath ?? '',
    method: entry.request.method,
    path: parsedUrl.pathname ?? '',
  }
}
