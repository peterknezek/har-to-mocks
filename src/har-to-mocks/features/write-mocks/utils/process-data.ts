import path from 'node:path';
import { URL } from 'node:url';

import type { Entry } from '../../../types/index.js';
import { OutputFormat } from '../../../types/index.js';
import { chromeOverridePathParts } from './chrome-overrides.js';

/**
 * Resolves the folder and file name the entry is written to.
 */
export const entryToFilePath = (entry: Entry, targetPath: string, format = OutputFormat.mocks) => {
  if (format === OutputFormat.chromeOverrides) {
    const parts = chromeOverridePathParts(entry.request.url, targetPath);
    return {
      filePath: path.join(targetPath, ...parts.slice(0, -1)),
      fileName: parts[parts.length - 1],
    };
  }

  const parsedUrl = new URL(entry.request.url);
  return {
    filePath: path.join(targetPath, parsedUrl.pathname),
    fileName: `${entry.request.method.toUpperCase()}.json`,
  };
};

const responseBody = (entry: Entry, format: OutputFormat): string | Buffer => {
  // Handle missing text content (can happen with binary content, errors, or uncaptured responses)
  const text = entry.response.content.text ?? '';
  // Chrome serves override files byte for byte, so binary responses have to be decoded
  if (format === OutputFormat.chromeOverrides && entry.response.content.encoding === 'base64') {
    return Buffer.from(text, 'base64');
  }
  return text;
};

export const entrysToPathsWithData = (entrys: Entry[], targetPath: string, format = OutputFormat.mocks) =>
  entrys.map((entry) => ({
    ...entryToFilePath(entry, targetPath, format),
    fileData: responseBody(entry, format),
  }));
