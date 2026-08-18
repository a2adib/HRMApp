// Values starting with these characters are interpreted as formulas by Excel,
// Google Sheets and LibreOffice. A username like `=HYPERLINK(...)` would execute
// when HR opens the exported file, so those cells get prefixed with a quote.
const FORMULA_START = /^[=+\-@\t\r]/;

const escapeCell = (value) => {
  const raw = value === null || value === undefined ? '' : String(value);
  const safe = FORMULA_START.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

/**
 * Build an RFC 4180 CSV string.
 *
 * @param {Array<object>} rows
 * @param {Array<{ label: string, value: (row: object) => any }>} columns
 */
export const toCsv = (rows, columns) => {
  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(column.value(row))).join(',')
  );
  return [header, ...body].join('\r\n');
};
