"use client";

import { Clock } from "lucide-react";

import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMeetings } from "@/hooks/useMeetings";
import { formatRelative } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export function RecentActivity() {
  const { data: meetings, loading, error, refetch } = useMeetings("recent");

  return (
    <section>
      <h3 className="text-base font-semibold text-zoom-text">Recent activity</h3>

      <div className="mt-3">
        {loading ? (
          <div className="divide-y divide-zoom-border">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message="Could not load recent activity." onRetry={refetch} />
        ) : (meetings?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="No recent activity"
            description="Meetings you have finished will show up here."
          />
        ) : (
          <ul className="divide-y divide-zoom-border">
            {meetings?.map((meeting) => (
              <ActivityRow key={meeting.id} meeting={meeting} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ActivityRow({ meeting }: { meeting: Meeting }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zoom-text">{meeting.topic}</p>
        <p className="mt-0.5 text-[13px] text-zoom-text-muted">
          {meeting.meeting_id_formatted}
        </p>
      </div>

      <p className="shrink-0 text-[13px] text-zoom-text-muted">
        {meeting.ended_at ? formatRelative(meeting.ended_at) : null}
      </p>
    </li>
  );
}
