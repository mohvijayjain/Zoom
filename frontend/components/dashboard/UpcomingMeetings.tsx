"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMeetings } from "@/hooks/useMeetings";
import { formatDuration, formatMeetingDay, formatTimeOfDay } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export function UpcomingMeetings() {
  const { data: meetings, loading, error, refetch } = useMeetings("upcoming");
  const isEmpty = !loading && !error && (meetings?.length ?? 0) === 0;

  return (
    <div>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-zoom-text">Meetings</h3>
          <Link
            href="/meetings"
            className="text-[13px] text-zoom-blue underline-offset-2 hover:underline"
          >
            Visit Meetings
          </Link>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState message="Could not load your meetings." onRetry={refetch} />
          ) : isEmpty ? (
            // Zoom's own empty state: a plain grey bar, not an illustration.
            <div className="rounded-md bg-[#F5F5F7] px-4 py-3 text-center text-[13px] text-zoom-text-muted">
              No Upcoming Meetings
            </div>
          ) : (
            <ul className="divide-y divide-zoom-border">
              {meetings?.map((meeting) => (
                <MeetingRow key={meeting.id} meeting={meeting} />
              ))}
            </ul>
          )}
        </div>
      </Card>

      {isEmpty ? (
        <div className="mt-3 flex justify-center">
          <Button variant="secondary" size="sm">
            Test Audio and Video
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function MeetingRow({ meeting }: { meeting: Meeting }) {
  // `upcoming` only ever returns rows with a start time, but the type allows null.
  const start = meeting.scheduled_start;

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <p className="truncate text-sm font-medium text-zoom-text">{meeting.topic}</p>
      <p className="mt-1 text-[13px] text-zoom-text-muted">
        {start
          ? [
              formatMeetingDay(start, meeting.timezone),
              formatTimeOfDay(start, meeting.timezone),
              formatDuration(meeting.duration_min),
            ].join(" · ")
          : formatDuration(meeting.duration_min)}
      </p>
    </li>
  );
}
