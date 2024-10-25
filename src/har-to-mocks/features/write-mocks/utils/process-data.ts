import path from 'path';
import { URL } from 'url';

import type { Entry } from '../../../types';

export const entrysToPathsWithData = (entrys: Entry[], targetPath: string) =>
  entrys.map((entry) => {
    const parsedUrl = new URL(entry.request.url);
    const filePath = path.join(targetPath, parsedUrl.pathname, parsedUrl.search);
    const fileName = `${entry.request.method.toUpperCase()}.json`;
    const fileData = entry.response.content.text;
    return {
      filePath,
      fileName,
      fileData,
    };
  });
