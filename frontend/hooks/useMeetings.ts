"use client";

import { getMeetings } from "@/lib/api";
import type { Meeting } from "@/lib/types";

import { type ApiResource, useApiResource } from "./useApiResource";

export type MeetingFilter = "upcoming" | "recent";

/** Refetches whenever `filter` changes. */
export function useMeetings(filter: MeetingFilter): ApiResource<Meeting[]> {
  return useApiResource<Meeting[]>(() => getMeetings(filter), [filter]);
}
