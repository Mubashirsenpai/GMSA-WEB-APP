/** Escape a value for CSV (wrap in quotes if contains comma, newline, or quote) */
function escapeCsvValue(value: unknown): string {
  if (value == null || value === "") return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build CSV string from array of row objects. Columns define header and which keys to export. */
export function buildCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCsvValue(row[c])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

/** Trigger browser download of a CSV file */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
