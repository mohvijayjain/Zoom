/** Mirrors the backend Pydantic response schemas. */

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_initial: string;
  personal_meeting_id: string;
  /** Server-computed "541 6806 1911" grouping — never re-derive this. */
  personal_meeting_id_formatted: string;
  plan: string;
}

export type MeetingStatus = "scheduled" | "live" | "ended";

export interface Meeting {
  id: number;
  meeting_id: string;
  /** Server-computed grouping — never re-derive this. */
  meeting_id_formatted: string;
  host_id: number;
  topic: string;
  description: string | null;
  /** Naive UTC, e.g. "2027-01-15T05:00:00" — always read via parseUtc(). */
  scheduled_start: string | null;
  duration_min: number;
  timezone: string;
  passcode: string;
  is_instant: boolean;
  is_personal_room: boolean;
  status: MeetingStatus;
  created_at: string;
  ended_at: string | null;
}

/** Only GET /meetings/{id} embeds the host; the list endpoints do not. */
export interface MeetingWithHost extends Meeting {
  host: User;
}

export interface Participant {
  id: number;
  meeting_id: number;
  user_id: number | null;
  display_name: string;
  is_host: boolean;
  is_muted: boolean;
  video_on: boolean;
  joined_at: string;
  left_at: string | null;
}

export interface InstantMeetingResponse {
  meeting: Meeting;
  invite_link: string;
}

/** POST /meetings/{id}/join */
export interface JoinResponse {
  participant: Participant;
  meeting: Meeting;
}
