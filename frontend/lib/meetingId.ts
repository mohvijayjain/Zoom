/**
 * Meeting-ID input handling.
 *
 * People paste IDs in several shapes: bare digits, spaced groups ("541 6806
 * 1911"), or a whole invite URL. These helpers reduce all of them to the
 * digits the API expects, and format them back for display.
 */

/** Matches the ID segment of an invite URL, e.g. ".../j/54168061911". */
const INVITE_URL_SEGMENT = /\/j\/([^/?#\s]+)/i;

const MEETING_ID_PATTERN = /^\d{9,11}$/;

export const MEETING_ID_MAX_DIGITS = 11;

/**
 * Strip whitespace and hyphens, unwrapping an invite URL if one was pasted.
 *
 * Letters are deliberately preserved — a personal link name is a legitimate
 * value in the real product, and rejecting it here would silently erase it.
 */
export function normalizeMeetingId(input: string): string {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(INVITE_URL_SEGMENT);
  const candidate = fromUrl ? fromUrl[1] : trimmed;

  return candidate.replace(/[\s-]/g, "");
}

export function isValidMeetingId(input: string): boolean {
  return MEETING_ID_PATTERN.test(normalizeMeetingId(input));
}

/** Live display formatting: digits only, regrouped 3-4-4, capped at 11. */
export function formatMeetingIdInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, MEETING_ID_MAX_DIGITS);

  return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7, 11)]
    .filter(Boolean)
    .join(" ");
}

/**
 * True when the input is still "just digits" (allowing the spaces and hyphens
 * people type), so the live formatter knows whether it may regroup. A personal
 * link name falls through untouched.
 */
export function looksNumeric(input: string): boolean {
  return /^[\d\s-]*$/.test(input);
}
