import path from 'node:path';

/**
 * Maps request URLs to file paths the same way Chrome DevTools Local Overrides does,
 * so the written files are picked up when the folder is selected in Sources > Overrides.
 *
 * Mirrors `NetworkPersistenceManager.rawPathFromUrl()` from Chrome DevTools:
 * https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/models/persistence/NetworkPersistenceManager.ts
 */

/** DevTools moves a file to `<host>/longurls/` when the folder URL and file path together exceed this length. */
const MAX_PATH_LENGTH = 200;

const WINDOWS_RESERVED_FILENAMES = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  'com1',
  'com2',
  'com3',
  'com4',
  'com5',
  'com6',
  'com7',
  'com8',
  'com9',
  'lpt1',
  'lpt2',
  'lpt3',
  'lpt4',
  'lpt5',
  'lpt6',
  'lpt7',
  'lpt8',
  'lpt9',
]);

const toHex = (char: string) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`;

/**
 * Splits the path into folder and file names. The query string stays part of the file name.
 */
const fileNameParts = (encodedPath: string): string[] => {
  const queryIndex = encodedPath.indexOf('?');
  if (queryIndex === -1) {
    return encodedPath.split('/');
  }
  const parts = encodedPath.slice(0, queryIndex).split('/');
  parts[parts.length - 1] += encodedPath.slice(queryIndex);
  return parts;
};

const encodeLocalPathParts = (encodedPath: string, isWindows: boolean): string[] =>
  fileNameParts(encodedPath)
    .filter(Boolean)
    .map((part) => {
      // encodeURI() escapes all the unsafe file name characters except '/' and '*'
      let name = encodeURI(part).replace(/[/*]/g, toHex);
      if (name === '..') {
        name = '%2E%2E';
      } else if (name === '.') {
        name = '%2E';
      }
      if (isWindows) {
        name = name.replace(/[:?]/g, toHex);
        if (WINDOWS_RESERVED_FILENAMES.has(name.toLowerCase())) {
          name = name.split('').map(toHex).join('');
        }
        if (name.endsWith('.')) {
          name = `${name.slice(0, -1)}%2E`;
        }
      }
      return name;
    });

/**
 * Mirrors `Common.ParsedURL.extractExtension()`.
 */
const extractExtension = (encodedPath: string): string => {
  const [pathname] = encodedPath.split('?');
  const name = pathname.slice(pathname.lastIndexOf('/') + 1);
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) {
    return '';
  }
  const extension = name.slice(dotIndex + 1);
  const percentIndex = extension.indexOf('%');
  return percentIndex === -1 ? extension : extension.slice(0, percentIndex);
};

/**
 * Mirrors `Platform.StringUtilities.hashCode()`, used to name files of long URLs.
 */
export const hashCode = (string: string): number => {
  if (!string) {
    return 0;
  }
  const p = (1 << 30) * 4 - 5; // prime: 2^32 - 5
  const z = 0x5033d967;
  const z2 = 0x59d2f15d;
  let s = 0;
  let zi = 1;
  for (let i = 0; i < string.length; i++) {
    const xi = string.charCodeAt(i) * z2;
    s = (s + zi * xi) % p;
    zi = (zi * z) % p;
  }
  s = (s + zi * (p - 1)) % p;
  return Math.abs(s | 0);
};

/**
 * The overrides folder as DevTools sees it (`file:///...`, mirrors `Common.ParsedURL.rawPathToUrlString()`).
 * Its length decides whether a URL counts as long.
 */
const folderUrl = (targetPath: string): string => {
  let preEncodedPath = path.resolve(targetPath).replace(/\\/g, '/');
  for (const specialChar of ['%', ';', '#', '?', ' ']) {
    preEncodedPath = preEncodedPath.replaceAll(specialChar, encodeURIComponent(specialChar));
  }
  preEncodedPath = preEncodedPath.startsWith('/') ? `file://${preEncodedPath}` : `file:///${preEncodedPath}`;
  let url = new URL(preEncodedPath).toString();
  while (url.endsWith('/') && url.length > 'file:///'.length) {
    url = url.slice(0, -1);
  }
  return url;
};

/**
 * Returns the path of the override file for a request URL, relative to the overrides folder,
 * split into folder names and the file name (last item).
 *
 * @param url - Request URL as recorded in the .har file
 * @param targetPath - The overrides folder
 * @param isWindows - Windows needs additional escaping of file names
 */
export const chromeOverridePathParts = (
  url: string,
  targetPath: string,
  isWindows = process.platform === 'win32',
): string[] => {
  let encodedPath = url.replace(/^https?:\/\//, '');
  const hashIndex = encodedPath.indexOf('#');
  if (hashIndex !== -1) {
    encodedPath = encodedPath.slice(0, hashIndex);
  }
  if (encodedPath.endsWith('/') && !encodedPath.includes('?')) {
    encodedPath += 'index.html';
  }

  const parts = encodeLocalPathParts(encodedPath, isWindows);
  const joinedParts = parts.join('/');
  if (folderUrl(targetPath).length + joinedParts.length <= MAX_PATH_LENGTH) {
    return parts;
  }

  const shortFileName = parts[parts.length - 1].slice(0, 10);
  const extension = extractExtension(encodedPath);
  const extensionPart = extension ? `.${extension.slice(0, 10)}` : '';
  return [parts[0], 'longurls', `${shortFileName}-${hashCode(joinedParts).toString(16)}${extensionPart}`];
};
