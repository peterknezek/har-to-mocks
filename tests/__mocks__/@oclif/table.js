// Mock for @oclif/table ESM module
// This allows Jest (CommonJS) tests to work with dynamic import('@oclif/table')

function makeTable(options) {
  const { data, columns = [] } = options;

  if (!data || data.length === 0) return '';

  // Extract column keys and names
  const cols = columns.map(col => ({
    key: typeof col === 'string' ? col : col.key,
    name: typeof col === 'string' ? col : (col.name || col.key),
  }));

  // If no columns specified, use keys from first data row
  const columnDefs = cols.length > 0 ? cols : Object.keys(data[0] || {}).map(key => ({ key, name: key }));

  // Build header row
  const headers = columnDefs.map(col => col.name).join(' │ ');
  const separator = columnDefs.map(() => '─'.repeat(10)).join('─┼─');

  // Build data rows
  const rows = data.map(row =>
    columnDefs.map(col => String(row[col.key] || '')).join(' │ ')
  );

  return `┌─${separator}─┐\n│ ${headers} │\n├─${separator}─┤\n${rows.map(r => `│ ${r} │`).join('\n')}\n└─${separator}─┘`;
}

function printTable(options) {
  console.log(makeTable(options));
}

function printTables(tables, options) {
  Object.values(tables).forEach((table) => printTable(table));
}

module.exports = {
  makeTable,
  printTable,
  printTables,
};
