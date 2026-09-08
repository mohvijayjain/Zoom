/**
 * Date/duration formatting.
 *
 * The backend returns *naive UTC* strings ("2027-01-15T05:00:00", no `Z`).
 * `new Date()` treats those as local time, silently shifting every timestamp
 * by the viewer's offset — so every parse goes through `parseUtc`.
 */

/** Parse a backend timestamp as UTC, tolerating strings that already carry an offset. */
export function parseUtc(iso: string): Date {
  return new Date(/[Zz]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
}

const DEFAULT_LOCALE = "en-US";

function dateParts(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(date);
}

function timePart(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
}

/** Calendar day *in the given timezone*, as "2026-09-07", for day comparisons. */
function dayKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "Mon, Sep 7 · 7:30 PM" */
export function formatMeetingTime(iso: string, timeZone: string): string {
  const date = parseUtc(iso);
  return `${dateParts(date, timeZone)} · ${timePart(date, timeZone)}`;
}

/**
 * "7:30 PM" — the clock half of `formatMeetingTime`.
 *
 * Needed wherever the day is already shown separately (see UpcomingMeetings):
 * pairing `formatMeetingDay` with the full `formatMeetingTime` would render
 * the date twice.
 */
export function formatTimeOfDay(iso: string, timeZone: string): string {
  return timePart(parseUtc(iso), timeZone);
}

/** "Today" / "Tomorrow" / "Mon, Sep 7" — compared in the meeting's timezone. */
export function formatMeetingDay(iso: string, timeZone: string): string {
  const date = parseUtc(iso);
  const now = new Date();
  const target = dayKey(date, timeZone);

  if (target === dayKey(now, timeZone)) return "Today";

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (target === dayKey(tomorrow, timeZone)) return "Tomorrow";

  return dateParts(date, timeZone);
}

/** "40 min" / "1 hr" / "1 hr 30 min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now" / "12 min ago" / "2 hours ago" / "Yesterday" / "3 days ago" */
export function formatRelative(iso: string): string {
  const elapsed = Date.now() - parseUtc(iso).getTime();

  if (elapsed < MINUTE) return "just now";

  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)} min ago`;
  }

  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(elapsed / DAY);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  // Beyond a week, an absolute date reads better than a day count. No timezone
  // is supplied for this signature, so fall back to the viewer's local zone.
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
  }).format(parseUtc(iso));
}
