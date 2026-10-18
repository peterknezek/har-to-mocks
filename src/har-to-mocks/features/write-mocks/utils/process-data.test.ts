import type { Entry } from '../../../types/index.js';
import { OutputFormat } from '../../../types/index.js';
import { entrysToPathsWithData } from './process-data.js';

describe('Write mocks - process data', () => {
  it('should be Entry prepared for saving files', () => {
    const mockEntrys = [
      {
        request: {
          method: 'GET',
          url: 'https://sample.com/api/service/a',
        },
        response: {
          content: {
            text: '{}',
          },
        },
      },
    ] as Entry[];
    const result = entrysToPathsWithData(mockEntrys, './mocks');
    expect(result).toMatchSnapshot();
  });

  it('should handle entries with missing text content', () => {
    const mockEntrys = [
      {
        request: {
          method: 'GET',
          url: 'https://sample.com/api/service/b',
        },
        response: {
          content: {
            size: 0,
            mimeType: 'application/json',
            // text field is missing
          },
        },
      },
    ] as Entry[];
    const result = entrysToPathsWithData(mockEntrys, './mocks');
    expect(result).toEqual([
      {
        filePath: 'mocks/api/service/b',
        fileName: 'GET.json',
        fileData: '',
      },
    ]);
  });

  it('should prepare files for Chrome overrides', () => {
    const mockEntrys = [
      {
        request: {
          method: 'POST',
          url: 'https://sample.com/api/search?q=test',
        },
        response: {
          content: {
            text: '{}',
          },
        },
      },
    ] as Entry[];
    const result = entrysToPathsWithData(mockEntrys, './overrides', OutputFormat.chromeOverrides);
    expect(result).toEqual([
      {
        filePath: 'overrides/sample.com/api',
        fileName: 'search?q=test',
        fileData: '{}',
      },
    ]);
  });

  it('should decode base64 responses for Chrome overrides only', () => {
    const mockEntrys = [
      {
        request: {
          method: 'GET',
          url: 'https://sample.com/images/logo.png',
        },
        response: {
          content: {
            mimeType: 'image/png',
            encoding: 'base64',
            text: 'iVBORw0KGgo=',
          },
        },
      },
    ] as Entry[];
    const [chromeFile] = entrysToPathsWithData(mockEntrys, './overrides', OutputFormat.chromeOverrides);
    expect(chromeFile.fileData).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    const [mockFile] = entrysToPathsWithData(mockEntrys, './mocks');
    expect(mockFile.fileData).toBe('iVBORw0KGgo=');
  });
});
