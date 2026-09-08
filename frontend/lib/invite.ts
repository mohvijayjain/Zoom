import type { Meeting } from "./types";

/** Origin of this app. Falls back to an env value when there is no `window`. */
function appOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function buildInviteLink(meetingId: string): string {
  return `${appOrigin()}/j/${meetingId}`;
}

/** The multi-line text the "Copy Invitation" button puts on the clipboard. */
export function buildInviteText(meeting: Meeting): string {
  return [
    meeting.topic,
    "",
    "Join Zoom Meeting",
    buildInviteLink(meeting.meeting_id),
    "",
    `Meeting ID: ${meeting.meeting_id_formatted}`,
    `Passcode: ${meeting.passcode}`,
  ].join("\n");
}
