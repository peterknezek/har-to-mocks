import type { Entry } from '../../../types';
import { entrysToPathsWithData } from './process-data';

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
    expect(result).toEqual([{ fileData: '{}', fileName: 'GET.json', filePath: 'mocks/api/service/a' }]);
  });
});
