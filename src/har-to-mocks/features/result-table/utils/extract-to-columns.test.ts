import { extractToColumns } from './extract-to-columns';
import type { Entry } from '../../../types';

describe('Result table - extract to columns', () => {
  it('should be Entry prepared for saving files', () => {
    const mockEntrys = {
      request: {
        method: 'GET',
        url: 'https://sample.com/api/service/a',
      },
    } as Entry;
    const result = extractToColumns(mockEntrys);
    expect(result).toEqual({ method: 'GET', name: 'a', path: '/api/service/a' });
  });

  it('should be Entry prepared for saving files also when url is just domain', () => {
    const mockEntrys = {
      request: {
        method: 'GET',
        url: 'https://sample.com',
      },
    } as Entry;
    const result = extractToColumns(mockEntrys);
    expect(result).toEqual({ method: 'GET', name: '', path: '/' });
  });
});
