import path from 'node:path';
import { URL } from 'node:url';

import type { Entry } from '../../../types/index.js';

export const entrysToPathsWithData = (entrys: Entry[], targetPath: string) =>
  entrys.map((entry) => {
    const parsedUrl = new URL(entry.request.url);
    const filePath = path.join(targetPath, parsedUrl.pathname);
    const fileName = `${entry.request.method.toUpperCase()}.json`;
    // Handle missing text content (can happen with binary content, errors, or uncaptured responses)
    const fileData = entry.response.content.text ?? '';
    return {
      filePath,
      fileName,
      fileData,
    };
  });
