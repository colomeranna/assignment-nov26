function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toLocalDateTime(d: Date): string {
  return `${toLocalDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

/** The nth weekday after `from` (n > 0) or before it (n < 0), never `from` itself. */
export function nthWeekday(from: Date, n: number): Date {
  const step = Math.sign(n);
  let d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let left = Math.abs(n);
  while (left > 0) {
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + step);
    if (isWeekday(d)) left--;
  }
  return d;
}

export function formatDay(date: string): string {
  return parseLocalDate(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDay(date: string): string {
  return parseLocalDate(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
