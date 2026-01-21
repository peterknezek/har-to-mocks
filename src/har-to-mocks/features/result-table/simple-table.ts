/**
 * Simple table formatter that creates ASCII tables without heavy dependencies
 */

interface Column {
  key: string;
  name: string;
}

interface TableOptions {
  data: Record<string, unknown>[];
  columns: Column[];
}

/**
 * Creates a simple ASCII table
 */
export function makeSimpleTable({ data, columns }: TableOptions): string {
  if (data.length === 0) {
    return '';
  }

  // Calculate column widths
  const widths: Record<string, number> = {};
  columns.forEach((col) => {
    widths[col.key] = col.name.length;
  });

  data.forEach((row) => {
    columns.forEach((col) => {
      const value = String(row[col.key] ?? '');
      widths[col.key] = Math.max(widths[col.key], value.length);
    });
  });

  // Build table
  const lines: string[] = [];

  // Header row
  const headerRow = columns
    .map((col) => col.name.padEnd(widths[col.key]))
    .join(' │ ');
  lines.push(headerRow);

  // Separator
  const separator = columns
    .map((col) => '─'.repeat(widths[col.key]))
    .join('─┼─');
  lines.push(separator);

  // Data rows
  data.forEach((row) => {
    const dataRow = columns
      .map((col) => String(row[col.key] ?? '').padEnd(widths[col.key]))
      .join(' │ ');
    lines.push(dataRow);
  });

  return lines.join('\n');
}
