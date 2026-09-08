"use client";

import { useCallback, useState } from "react";

import {
  ApiError,
  type ScheduledMeetingPayload,
  createScheduledMeeting,
} from "@/lib/api";
import type { Meeting } from "@/lib/types";

export type CreateMeetingController = {
  create: (payload: ScheduledMeetingPayload) => Promise<Meeting | null>;
  creating: boolean;
  error: ApiError | null;
};

/** One-shot mutation, so it exposes an imperative `create` rather than fetching. */
export function useCreateMeeting(): CreateMeetingController {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const create = useCallback(async (payload: ScheduledMeetingPayload) => {
    setCreating(true);
    setError(null);

    try {
      return await createScheduledMeeting(payload);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, "Could not schedule the meeting. Please try again."),
      );
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  return { create, creating, error };
}
