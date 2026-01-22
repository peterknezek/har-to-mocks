import { describe, expect, it } from 'vitest';

import { formatJson, formatResponsePreview } from './format-json.js';

describe('formatJson', () => {
  it('should format valid JSON with default indentation', () => {
    const input = '{"name":"test","value":123}';
    const expected = `{
  "name": "test",
  "value": 123
}`;
    expect(formatJson(input)).toBe(expected);
  });

  it('should format valid JSON with custom indentation', () => {
    const input = '{"name":"test"}';
    const expected = `{
    "name": "test"
}`;
    expect(formatJson(input, { indent: 4 })).toBe(expected);
  });

  it('should return raw text for invalid JSON', () => {
    const input = 'This is not JSON';
    expect(formatJson(input)).toBe(input);
  });

  it('should return "(empty response)" for undefined input', () => {
    expect(formatJson(undefined)).toBe('(empty response)');
  });

  it('should return "(empty response)" for empty string', () => {
    expect(formatJson('')).toBe('(empty response)');
  });

  it('should return "(empty response)" for whitespace-only string', () => {
    expect(formatJson('   ')).toBe('(empty response)');
  });

  it('should truncate output when exceeding maxLines', () => {
    const input = JSON.stringify({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    const result = formatJson(input, { maxLines: 3 });

    expect(result).toContain('... (');
    expect(result).toContain('more lines)');
    expect(result.split('\n').length).toBe(4); // 3 lines + truncation message
  });

  it('should not truncate when within maxLines limit', () => {
    const input = '{"name":"test"}';
    const result = formatJson(input, { maxLines: 10 });

    expect(result).not.toContain('...');
  });

  it('should handle arrays correctly', () => {
    const input = '[1,2,3]';
    const expected = `[
  1,
  2,
  3
]`;
    expect(formatJson(input)).toBe(expected);
  });

  it('should handle nested objects', () => {
    const input = '{"outer":{"inner":"value"}}';
    const result = formatJson(input);

    expect(result).toContain('"outer"');
    expect(result).toContain('"inner"');
    expect(result).toContain('"value"');
  });
});

describe('formatResponsePreview', () => {
  it('should format response text the same as formatJson', () => {
    const input = '{"status":"ok"}';
    expect(formatResponsePreview(input)).toBe(formatJson(input));
  });

  it('should pass options to formatJson', () => {
    const input = '{"a":1}';
    expect(formatResponsePreview(input, { indent: 4 })).toBe(formatJson(input, { indent: 4 }));
  });

  it('should handle undefined response text', () => {
    expect(formatResponsePreview(undefined)).toBe('(empty response)');
  });
});
