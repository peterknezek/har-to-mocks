import { describe, expect, it } from 'vitest';

import { parseSelection } from './parse-selection.js';

describe('parseSelection', () => {
  it('should convert row numbers to zero-based indexes', () => {
    expect(parseSelection(['1,3'], 5)).toEqual([0, 2]);
  });

  it('should expand ranges', () => {
    expect(parseSelection(['2-4'], 5)).toEqual([1, 2, 3]);
  });

  it('should merge repeated flags, sort and remove duplicates', () => {
    expect(parseSelection(['5, 1', '1-2'], 5)).toEqual([0, 1, 4]);
  });

  it.each(['', 'a', '0', '3-1', '1-', '-2', '1.5'])('should reject "%s"', (value) => {
    expect(() => parseSelection([value], 5)).toThrow(`Invalid --select value "${value}"`);
  });

  it('should reject numbers above the number of rows', () => {
    expect(() => parseSelection(['2-6'], 5)).toThrow(
      'Row 6 does not exist in --select. There are 5 filtered requests.',
    );
  });
});
