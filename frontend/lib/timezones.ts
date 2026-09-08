/**
 * Curated IANA timezone list.
 *
 * Display names are hardcoded; the GMT offset in each label is computed from
 * Intl at module load so the labels never go stale across DST changes.
 */

type ZoneSeed = { value: string; name: string };

const ZONES: ZoneSeed[] = [
  { value: "Pacific/Midway", name: "Midway Island, Samoa" },
  { value: "America/Anchorage", name: "Alaska" },
  { value: "America/Los_Angeles", name: "Pacific Time (US and Canada)" },
  { value: "America/Denver", name: "Mountain Time (US and Canada)" },
  { value: "America/Chicago", name: "Central Time (US and Canada)" },
  { value: "America/New_York", name: "Eastern Time (US and Canada)" },
  { value: "America/Mexico_City", name: "Mexico City" },
  { value: "America/Bogota", name: "Bogota, Lima, Quito" },
  { value: "America/Sao_Paulo", name: "Brasilia" },
  { value: "Atlantic/Azores", name: "Azores" },
  { value: "Europe/London", name: "London" },
  { value: "Europe/Paris", name: "Paris, Amsterdam, Madrid" },
  { value: "Europe/Berlin", name: "Berlin, Rome, Stockholm" },
  { value: "Europe/Athens", name: "Athens, Helsinki, Istanbul" },
  { value: "Europe/Moscow", name: "Moscow, St. Petersburg" },
  { value: "Asia/Dubai", name: "Abu Dhabi, Muscat" },
  { value: "Asia/Karachi", name: "Karachi, Islamabad" },
  { value: "Asia/Kolkata", name: "India" },
  { value: "Asia/Kathmandu", name: "Kathmandu" },
  { value: "Asia/Dhaka", name: "Dhaka, Almaty" },
  { value: "Asia/Bangkok", name: "Bangkok, Jakarta, Hanoi" },
  { value: "Asia/Singapore", name: "Singapore, Kuala Lumpur" },
  { value: "Asia/Shanghai", name: "Beijing, Shanghai, Hong Kong" },
  { value: "Asia/Tokyo", name: "Tokyo, Osaka, Seoul" },
  { value: "Australia/Sydney", name: "Sydney, Melbourne" },
  { value: "Pacific/Auckland", name: "Auckland, Wellington" },
  { value: "UTC", name: "Coordinated Universal Time" },
];

/** "GMT+5:30" — hours unpadded, matching the reference's India entry. */
function gmtOffset(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(new Date());

    const raw = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
    const match = raw.match(/GMT([+-])(\d{1,2}):(\d{2})/);

    // Zones sitting exactly on UTC report a bare "GMT".
    if (!match) return "GMT+0:00";

    const [, sign, hours, minutes] = match;
    return `GMT${sign}${Number(hours)}:${minutes}`;
  } catch {
    return "GMT+0:00";
  }
}

export type TimezoneOption = { value: string; label: string };

export const TIMEZONES: TimezoneOption[] = ZONES.map(({ value, name }) => ({
  value,
  label: `(${gmtOffset(value)}) ${name}`,
}));

/** Ensures an arbitrary browser zone is selectable even if it's not curated. */
export function withZone(timeZone: string): TimezoneOption[] {
  if (TIMEZONES.some((zone) => zone.value === timeZone)) return TIMEZONES;
  return [{ value: timeZone, label: `(${gmtOffset(timeZone)}) ${timeZone}` }, ...TIMEZONES];
}
