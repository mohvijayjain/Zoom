"use client";

import { getMe } from "@/lib/api";
import type { User } from "@/lib/types";

import { type ApiResource, useApiResource } from "./useApiResource";

/** The seeded default user — stands in for the session (no auth in this app). */
export function useCurrentUser(): ApiResource<User> {
  return useApiResource<User>(getMe, []);
}
