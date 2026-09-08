/**
 * Transport layer. Nothing outside this file calls `fetch`, and every failure
 * surfaces as an `ApiError` so callers handle exactly one error type.
 */

import type {
  InstantMeetingResponse,
  JoinResponse,
  Meeting,
  MeetingWithHost,
  Participant,
  User,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    // DNS failure, connection refused, CORS rejection — status 0 marks
    // "never reached the server", which callers can message differently.
    throw new ApiError(0, "Could not reach the server. Is the API running?");
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "detail" in body) {
        const raw = (body as { detail: unknown }).detail;
        if (typeof raw === "string") detail = raw;
      }
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/me");
}

export function getMeetings(filter: "upcoming" | "recent"): Promise<Meeting[]> {
  return apiFetch<Meeting[]>(`/meetings?filter=${filter}`);
}

export function getMeeting(meetingId: string): Promise<MeetingWithHost> {
  return apiFetch<MeetingWithHost>(`/meetings/${encodeURIComponent(meetingId)}`);
}

export function createInstantMeeting(
  usePersonalRoom = false,
): Promise<InstantMeetingResponse> {
  return apiFetch<InstantMeetingResponse>(
    `/meetings/instant?use_personal_room=${usePersonalRoom}`,
    { method: "POST" },
  );
}

export function joinMeeting(
  meetingId: string,
  displayName: string,
): Promise<JoinResponse> {
  return apiFetch<JoinResponse>(
    `/meetings/${encodeURIComponent(meetingId)}/join`,
    { method: "POST", body: JSON.stringify({ display_name: displayName }) },
  );
}

export function getParticipants(meetingId: string): Promise<Participant[]> {
  return apiFetch<Participant[]>(
    `/meetings/${encodeURIComponent(meetingId)}/participants`,
  );
}

export function updateParticipant(
  participantId: number,
  patch: { is_muted?: boolean; video_on?: boolean },
): Promise<Participant> {
  return apiFetch<Participant>(`/participants/${participantId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export type ScheduledMeetingPayload = {
  topic: string;
  description: string | null;
  /** UTC ISO string from zonedWallClockToUtcIso. */
  scheduled_start: string;
  duration_min: number;
  timezone: string;
};

export function createScheduledMeeting(
  payload: ScheduledMeetingPayload,
): Promise<Meeting> {
  return apiFetch<Meeting>("/meetings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Leave or remove a participant.
 *
 * A soft delete on the server: `left_at` is stamped and the row stays, so the
 * attendance history survives while the participant drops out of every
 * client's next poll.
 */
export function removeParticipant(participantId: number): Promise<void> {
  return apiFetch<void>(`/participants/${participantId}`, { method: "DELETE" });
}

/** Ends the meeting for everyone: status=ended, left_at stamped on all. */
export function endMeeting(meetingId: string): Promise<Meeting> {
  return apiFetch<Meeting>(`/meetings/${encodeURIComponent(meetingId)}/end`, {
    method: "POST",
  });
}
