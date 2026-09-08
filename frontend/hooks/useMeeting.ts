"use client";

import { ApiError, getMeeting } from "@/lib/api";
import type { MeetingWithHost } from "@/lib/types";

import { useApiResource } from "./useApiResource";

/** Backend IDs are 11 digits; accept 9-11 so older/shorter IDs still resolve. */
const MEETING_ID_PATTERN = /^\d{9,11}$/;

export type MeetingResource = {
  meeting: MeetingWithHost | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
};

export function useMeeting(meetingId: string | null): MeetingResource {
  const valid = meetingId !== null && MEETING_ID_PATTERN.test(meetingId);

  const { data, loading, error, refetch } = useApiResource<MeetingWithHost>(
    () =>
      valid
        ? getMeeting(meetingId)
        : // A malformed URL is a 404 by definition — reject locally rather
          // than spending a round trip to learn that.
          Promise.reject(new ApiError(404, "Meeting ID not found")),
    [meetingId, valid],
  );

  return { meeting: data, loading, error, refetch };
}
