"use client";

import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function ProfileCard() {
  const { data: user, loading, error, refetch } = useCurrentUser();

  if (loading) {
    return (
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !user) {
    return (
      <Card>
        <ErrorState message="Could not load your profile." onRetry={refetch} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar initial={user.avatar_initial} size="lg" />
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-zoom-text">
              {user.name}
            </h2>
            <p className="mt-1 text-sm text-zoom-text-muted">Plan: {user.plan}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button variant="secondary" size="sm">
            Manage Plan
          </Button>
          <Link
            href="#"
            className="text-[13px] text-zoom-blue underline-offset-2 hover:underline"
          >
            View Plan Details
          </Link>
        </div>
      </div>
    </Card>
  );
}
