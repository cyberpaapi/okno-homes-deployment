export type ProcessDayRange = {
  label: string;
  range: string;
  display: string;
};

/** Keep the editorial label separate from the oversized timeline numerals. */
export function parseProcessDayRange(value: string): ProcessDayRange | null {
  const match = value.trim().match(/^(?:([\p{L}][\p{L}\p{M} -]{0,11})\s+)?(\d{1,2})\s*[–-]\s*(\d{1,2})$/u);
  if (!match) return null;

  const start = Number(match[2]);
  const end = Number(match[3]);
  if (start < 1 || end > 90 || start > end) return null;

  const label = match[1]?.trim().replace(/\s+/g, " ") || "Days";
  const range = `${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")}`;
  return { label, range, display: `${label} ${range}` };
}

export function resolveProcessDayRange(value: string, fallback: string): ProcessDayRange {
  return parseProcessDayRange(value) ?? parseProcessDayRange(fallback) ?? { label: "Days", range: "01–10", display: "Days 01–10" };
}
