import { describe, expect, it } from 'vitest';

import type { Entry } from '../../../types/index.js';
import { Method } from '../../../types/index.js';
import { markDuplicates } from './mark-duplicates.js';

const createEntry = (url: string, method: Method = Method.GET): Entry =>
  ({
    request: { url, method },
    response: { content: { text: '{}' } },
    _resourceType: 'xhr',
  }) as Entry;

describe('markDuplicates', () => {
  it('should mark all entries as willBeWritten when there are no duplicates', () => {
    const entries = [
      createEntry('https://api.example.com/users'),
      createEntry('https://api.example.com/posts'),
      createEntry('https://api.example.com/comments'),
    ];

    const result = markDuplicates(entries);

    expect(result).toHaveLength(3);
    expect(result[0].willBeWritten).toBe(true);
    expect(result[1].willBeWritten).toBe(true);
    expect(result[2].willBeWritten).toBe(true);
  });

  it('should mark only the last duplicate as willBeWritten', () => {
    const entries = [
      createEntry('https://api.example.com/search?q=javascript'),
      createEntry('https://api.example.com/search?q=python'),
      createEntry('https://api.example.com/users'),
    ];

    const result = markDuplicates(entries);

    expect(result).toHaveLength(3);
    // First entry with same path should be skipped
    expect(result[0].willBeWritten).toBe(false);
    // Last entry with same path should be written
    expect(result[1].willBeWritten).toBe(true);
    // Unique entry should be written
    expect(result[2].willBeWritten).toBe(true);
  });

  it('should consider method when determining duplicates', () => {
    const entries = [
      createEntry('https://api.example.com/users', Method.GET),
      createEntry('https://api.example.com/users', Method.POST),
    ];

    const result = markDuplicates(entries);

    expect(result).toHaveLength(2);
    // Both should be written because they have different methods
    expect(result[0].willBeWritten).toBe(true);
    expect(result[1].willBeWritten).toBe(true);
  });

  it('should handle multiple groups of duplicates', () => {
    const entries = [
      createEntry('https://api.example.com/search?q=a'),
      createEntry('https://api.example.com/search?q=b'),
      createEntry('https://api.example.com/users?id=1'),
      createEntry('https://api.example.com/users?id=2'),
      createEntry('https://api.example.com/users?id=3'),
    ];

    const result = markDuplicates(entries);

    expect(result).toHaveLength(5);
    expect(result[0].willBeWritten).toBe(false); // search - first
    expect(result[1].willBeWritten).toBe(true); // search - last
    expect(result[2].willBeWritten).toBe(false); // users - first
    expect(result[3].willBeWritten).toBe(false); // users - second
    expect(result[4].willBeWritten).toBe(true); // users - last
  });

  it('should return empty array for empty input', () => {
    const result = markDuplicates([]);
    expect(result).toHaveLength(0);
  });

  it('should preserve entry references', () => {
    const entries = [createEntry('https://api.example.com/users')];

    const result = markDuplicates(entries);

    expect(result[0].entry).toBe(entries[0]);
  });
});
