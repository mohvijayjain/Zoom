/**
 * Wall-clock ⇄ UTC conversion for the schedule form.
 *
 * The form collects a date, a time and a timezone; the backend stores naive
 * UTC. Turning "09/07/2026 7:30 PM in Asia/Kolkata" into the right instant is
 * the whole job of this file — get it wrong and every scheduled meeting
 * shifts. Built on Intl only, no date library.
 */

export type Meridiem = "AM" | "PM";

export const FALLBACK_TIME_ZONE = "Asia/Kolkata";

type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** What wall clock does `instant` read as, in `timeZone`? */
function wallClockIn(instant: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    // h23 rather than hour12:false — the latter can yield "24" for midnight.
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function toEpoch(clock: WallClock): number {
  return Date.UTC(
    clock.year,
    clock.month - 1,
    clock.day,
    clock.hour,
    clock.minute,
    clock.second,
  );
}

/** "7:30" + "PM" → { hour: 19, minute: 30 } */
export function to24Hour(time: string, meridiem: Meridiem): { hour: number; minute: number } {
  const [rawHour, rawMinute] = time.split(":").map(Number);
  const base = rawHour % 12; // 12 AM/PM both collapse to 0
  return {
    hour: meridiem === "PM" ? base + 12 : base,
    minute: rawMinute || 0,
  };
}

/**
 * Convert a wall clock in `timeZone` to a UTC ISO string.
 *
 * Guess that the wall clock *is* UTC, see what that instant reads as in the
 * target zone, and subtract the difference. The correction runs twice: a
 * single pass uses the offset at the wrong instant, which is off by an hour
 * for times near a DST boundary.
 */
export function zonedWallClockToUtcIso(
  date: string,
  time: string,
  meridiem: Meridiem,
  timeZone: string,
): string {
  const [year, month, day] = date.split("-").map(Number);
  const { hour, minute } = to24Hour(time, meridiem);

  const wanted = Date.UTC(year, month - 1, day, hour, minute, 0);

  let instant = wanted;
  for (let pass = 0; pass < 2; pass += 1) {
    const got = toEpoch(wallClockIn(new Date(instant), timeZone));
    instant -= got - wanted;
  }

  return new Date(instant).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Legacy IANA aliases mapped to their canonical names.
 *
 * Chrome reports "Asia/Calcutta" rather than "Asia/Kolkata", for example.
 * Both resolve to the same offsets, so conversion is unaffected — but the
 * alias does not match the curated timezone list, so it would be stored and
 * displayed instead of the friendly "(GMT+5:30) India" entry.
 */
const CANONICAL_ZONES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Chongqing": "Asia/Shanghai",
  "Asia/Chungking": "Asia/Shanghai",
  "Asia/Harbin": "Asia/Shanghai",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Rangoon": "Asia/Yangon",
  "Europe/Kiev": "Europe/Kyiv",
  "Australia/Canberra": "Australia/Sydney",
  "Australia/NSW": "Australia/Sydney",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "US/Pacific": "America/Los_Angeles",
  "US/Mountain": "America/Denver",
  "US/Central": "America/Chicago",
  "US/Eastern": "America/New_York",
  "Pacific/Samoa": "Pacific/Pago_Pago",
  "Etc/UTC": "UTC",
  "Etc/GMT": "UTC",
  "Etc/Universal": "UTC",
  Universal: "UTC",
  Zulu: "UTC",
  GMT: "UTC",
};

export function canonicalTimeZone(timeZone: string): string {
  return CANONICAL_ZONES[timeZone] ?? timeZone;
}

export function getBrowserTimeZone(): string {
  try {
    const reported = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return reported ? canonicalTimeZone(reported) : FALLBACK_TIME_ZONE;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

/** "YYYY-MM-DD" for today, as seen in `timeZone`. */
export function todayInZone(timeZone: string): string {
  const clock = wallClockIn(new Date(), timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${clock.year}-${pad(clock.month)}-${pad(clock.day)}`;
}

/** The next :00 or :30 in `timeZone`, as a form-ready time + meridiem. */
export function nextHalfHourInZone(timeZone: string): {
  time: string;
  meridiem: Meridiem;
} {
  const clock = wallClockIn(new Date(), timeZone);

  let hour = clock.hour;
  let minute = clock.minute < 30 ? 30 : 0;
  if (minute === 0) hour = (hour + 1) % 24;

  const meridiem: Meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return { time: `${displayHour}:${String(minute).padStart(2, "0")}`, meridiem };
}

/** Every 30-minute step, 12:00 through 11:30, in the reference's order. */
export const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const options: { value: string; label: string }[] = [];

  for (const hour of hours) {
    for (const minute of ["00", "30"]) {
      const value = `${hour}:${minute}`;
      options.push({ value, label: value });
    }
  }

  return options;
})();

export const MERIDIEM_OPTIONS = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

export const DURATION_HOUR_OPTIONS = Array.from({ length: 25 }, (_, hour) => ({
  value: String(hour),
  label: String(hour),
}));

/**
 * 40 is included alongside Zoom's usual 0/15/30/45 because the Basic plan cap
 * (and the backend default) is 40 minutes — without it the 40-minute default
 * has no matching <option> and the select silently falls back to 0.
 */
export const DURATION_MINUTE_OPTIONS = [0, 15, 30, 40, 45].map((minute) => ({
  value: String(minute),
  label: String(minute),
}));
