import { extractToColumns } from './extract-to-columns';
import type { Entry } from '../../../types';

describe('Result table - extract to columns', () => {
  it('should be Entry prepared for saving files', () => {
    const mockEntrys = {
      request: {
        method: 'GET',
        url: '/api/service/a',
      },
    } as Entry;
    const result = extractToColumns(mockEntrys);
    expect(result).toEqual({ method: 'GET', name: 'a', path: '/api/service/a' });
  });
});
