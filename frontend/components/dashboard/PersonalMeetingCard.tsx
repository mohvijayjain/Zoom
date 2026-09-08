"use client";

import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function PersonalMeetingCard() {
  const { data: user, loading, error, refetch } = useCurrentUser();

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-3 py-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-44" />
      </Card>
    );
  }

  if (error || !user) {
    return (
      <Card>
        <ErrorState message="Could not load your meeting ID." onRetry={refetch} />
      </Card>
    );
  }

  return (
    <Card className="py-5 text-center">
      <h3 className="text-sm font-medium text-zoom-text">Personal Meeting ID</h3>

      <div className="mt-2 flex items-center justify-center gap-1">
        <p className="text-lg font-medium tracking-wide text-zoom-text">
          {user.personal_meeting_id_formatted}
        </p>
        {/* Resolved on click so `location` is never read during SSR. */}
        <CopyButton
          value={() => `${window.location.origin}/j/${user.personal_meeting_id}`}
          label="Copy invite link"
        />
      </div>
    </Card>
  );
}
