import { extractToColumns } from './extract-to-columns.js';
import type { Entry } from '../../../types/index.js';

describe('Result table - extract to columns', () => {
  it('should be Entry prepared for saving files', () => {
    const mockEntrys = {
      request: {
        method: 'GET',
        url: 'https://sample.com/api/service/a',
      },
    } as Entry;
    const result = extractToColumns(mockEntrys);
    expect(result).toMatchSnapshot();
  });

  it('should be Entry prepared for saving files also when url is just domain', () => {
    const mockEntrys = {
      request: {
        method: 'GET',
        url: 'https://sample.com',
      },
    } as Entry;
    const result = extractToColumns(mockEntrys);
    expect(result).toMatchSnapshot();
  });

  it('should extract query parameters from URL', () => {
    const mockEntrys = {
      request: {
        method: 'GET',
        url: 'https://sample.com/complete/search?q=test&limit=10',
      },
    } as Entry;
    const result = extractToColumns(mockEntrys);
    expect(result).toMatchSnapshot();
  });

  it('should handle empty query string', () => {
    const mockEntrys = {
      request: {
        method: 'GET',
        url: 'https://sample.com/api/service/users',
      },
    } as Entry;
    const result = extractToColumns(mockEntrys);
    expect(result.query).toBe('');
  });
});
