"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, getParticipants } from "@/lib/api";
import type { Participant } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;

export type ParticipantsController = {
  participants: Participant[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
  /**
   * Timestamp of the last *successful* poll, or null before the first one.
   *
   * Callers use this to tell "the server says I am gone" from "the request
   * failed" — without it, one transient error would eject everybody.
   */
  lastSyncedAt: number | null;
};

/**
 * The single source of roster truth for a meeting.
 *
 * Instantiate this ONCE, in MeetingRoom, and pass it down. A second instance
 * would double the request rate and the two copies could disagree mid-poll.
 *
 * Polling rather than a WebSocket is deliberate: at 5s this is ~12
 * requests/minute against SQLite, which is nothing at demo scale, and it
 * costs a few lines instead of a socket layer.
 */
export function useParticipants(
  meetingId: string,
  seed: Participant[] = [],
): ParticipantsController {
  // Seeded so the grid is never briefly empty on first render.
  const [participants, setParticipants] = useState<Participant[]>(seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  const refetch = useCallback(() => setAttempt((n) => n + 1), []);

  // Avoids restarting the interval when only the manual trigger changes.
  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Nothing to render for a hidden tab — skip the request entirely.
      if (document.visibilityState === "hidden") return;

      try {
        const list = await getParticipants(meetingId);
        if (cancelled) return;
        setParticipants(list);
        setError(null);
        setLastSyncedAt(Date.now());
      } catch (err) {
        if (cancelled) return;
        // Leave the previous roster in place; the next tick retries.
        setError(
          err instanceof ApiError ? err : new ApiError(0, "Could not load participants."),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    // Refresh immediately when the tab comes back rather than waiting a tick.
    document.addEventListener("visibilitychange", load);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [meetingId, attempt]);

  return { participants, loading, error, refetch, lastSyncedAt };
}
