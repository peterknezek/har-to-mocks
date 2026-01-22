import type { Entry } from '../../../types/index.js';
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
});
