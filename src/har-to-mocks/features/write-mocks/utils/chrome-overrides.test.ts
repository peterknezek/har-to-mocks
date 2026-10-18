import { describe, expect, it } from 'vitest';

import { chromeOverridePathParts, hashCode } from './chrome-overrides.js';

// Expected paths were produced by NetworkPersistenceManager.rawPathFromUrl() of Chrome DevTools.
const overridePath = (url: string, targetPath = '/overrides', isWindows = false) =>
  chromeOverridePathParts(url, targetPath, isWindows).join('/');

describe('Write mocks - Chrome overrides path', () => {
  it('should use host and path as folders', () => {
    expect(overridePath('https://sample.com/api/service/userRoles')).toBe('sample.com/api/service/userRoles');
  });

  it('should keep the query string in the file name', () => {
    expect(overridePath('https://sample.com/complete/search?q=javascript')).toBe(
      'sample.com/complete/search?q=javascript',
    );
    expect(overridePath('https://sample.com/api/?page=2')).toBe('sample.com/api/?page=2');
  });

  it('should write index.html for a path ending with slash', () => {
    expect(overridePath('https://sample.com/api/')).toBe('sample.com/api/index.html');
  });

  it('should keep the port and drop the fragment', () => {
    expect(overridePath('http://localhost:3000/api/users#details')).toBe('localhost:3000/api/users');
  });

  it('should escape characters that are not allowed in file names', () => {
    expect(overridePath('https://sample.com/search?path=a/b&glob=*')).toBe('sample.com/search?path=a%2Fb&glob=%2A');
    expect(overridePath('https://sample.com/a%20b?q=hello%20world')).toBe('sample.com/a%2520b?q=hello%2520world');
  });

  it('should not write outside of the overrides folder', () => {
    expect(overridePath('https://sample.com/a/../b/./c')).toBe('sample.com/a/%2E%2E/b/%2E/c');
  });

  it('should escape file names on Windows', () => {
    expect(overridePath('http://localhost:3000/api/users?id=1', '/overrides', true)).toBe(
      'localhost%3A3000/api/users%3Fid=1',
    );
    expect(overridePath('https://sample.com/files/con', '/overrides', true)).toBe('sample.com/files/%63%6F%6E');
    expect(overridePath('https://sample.com/files/name.', '/overrides', true)).toBe('sample.com/files/name%2E');
  });

  it('should move long URLs to the longurls folder', () => {
    const id = 'a'.repeat(200);
    expect(overridePath(`https://sample.com/api/items/${id}.json?page=2`)).toBe(
      'sample.com/longurls/aaaaaaaaaa-44ea488e.json',
    );
    expect(overridePath(`https://sample.com/api/items/${id}`)).toBe('sample.com/longurls/aaaaaaaaaa-799e4831');
    expect(overridePath(`https://sample.com/api/items/${id}/`)).toBe('sample.com/longurls/index.html-45784010.html');
  });

  it('should count the length of the overrides folder for long URLs', () => {
    const url = `https://sample.com/api/${'b'.repeat(40)}`;
    expect(overridePath(url)).toBe(`sample.com/api/${'b'.repeat(40)}`);
    expect(overridePath(url, `/${'c'.repeat(150)}`)).toBe('sample.com/longurls/bbbbbbbbbb-e951627');
  });

  it('should hash empty string to zero', () => {
    expect(hashCode('')).toBe(0);
  });
});
