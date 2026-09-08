"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";

export type ApiResource<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
};

/**
 * Shared state machine behind the feature hooks: fetch on mount, refetch when
 * `deps` change or `refetch()` is called, and never set state after unmount.
 *
 * The fetcher is held in a ref so an inline arrow (`() => getMeetings(filter)`)
 * doesn't retrigger the effect on every render — `deps` alone decides that.
 */
export function useApiResource<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
): ApiResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err
            : new ApiError(0, "Something went wrong. Please try again."),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const refetch = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, loading, error, refetch };
}
