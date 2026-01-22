const DEFAULT_MAX_LINES = 15;
const DEFAULT_INDENT = 2;

interface FormatJsonOptions {
  /** Maximum number of lines to display (default: 15) */
  maxLines?: number;
  /** Indentation spaces (default: 2) */
  indent?: number;
}

/**
 * Formats a JSON string for display with proper indentation and optional truncation.
 * Handles invalid JSON gracefully by returning the raw text.
 *
 * @param text - The JSON string to format (or raw text if not valid JSON)
 * @param options - Formatting options
 * @returns Formatted string ready for display
 */
export const formatJson = (text: string | undefined, options: FormatJsonOptions = {}): string => {
  const { maxLines = DEFAULT_MAX_LINES, indent = DEFAULT_INDENT } = options;

  if (!text || text.trim() === '') {
    return '(empty response)';
  }

  let formatted: string;

  try {
    const parsed: unknown = JSON.parse(text);
    formatted = JSON.stringify(parsed, null, indent);
  } catch {
    // Not valid JSON, return raw text
    formatted = text;
  }

  const lines = formatted.split('\n');

  if (lines.length <= maxLines) {
    return formatted;
  }

  const truncated = lines.slice(0, maxLines).join('\n');
  const remainingLines = lines.length - maxLines;
  return `${truncated}\n... (${remainingLines} more lines)`;
};

/**
 * Extracts and formats the response body from a HAR entry's response content.
 *
 * @param responseText - The response content text from HAR entry
 * @param options - Formatting options
 * @returns Formatted response string
 */
export const formatResponsePreview = (responseText: string | undefined, options: FormatJsonOptions = {}): string => {
  return formatJson(responseText, options);
};
