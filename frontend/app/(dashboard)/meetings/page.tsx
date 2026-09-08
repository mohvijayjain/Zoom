"use client";

import { CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MeetingListItem } from "@/components/meetings/MeetingListItem";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMeetings } from "@/hooks/useMeetings";
import { cn } from "@/lib/utils";

type Tab = "upcoming" | "previous";

const TABS: { id: Tab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "previous", label: "Previous" },
];

export default function MeetingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");

  // "previous" maps to the API's `recent` filter.
  const { data: meetings, loading, error, refetch } = useMeetings(
    tab === "upcoming" ? "upcoming" : "recent",
  );

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zoom-text">Meetings</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push("/meetings/schedule")}
        >
          Schedule a Meeting
        </Button>
      </div>

      <div className="mt-6 flex gap-6 border-b border-zoom-border" role="tablist">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            onClick={() => setTab(entry.id)}
            className={cn(
              "-mb-px border-b-2 pb-2 text-sm transition-colors",
              tab === entry.id
                ? "border-zoom-blue font-medium text-zoom-blue"
                : "border-transparent text-zoom-text-muted hover:text-zoom-text",
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <Card className="mt-6 max-w-[1000px] p-6">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-4">
                <Skeleton className="h-9 w-32" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message="Could not load your meetings." onRetry={refetch} />
        ) : (meetings?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-6 w-6" />}
            title={tab === "upcoming" ? "No upcoming meetings" : "No previous meetings"}
            description={
              tab === "upcoming"
                ? "Meetings you schedule will appear here."
                : "Meetings you have finished will appear here."
            }
          />
        ) : (
          <ul>
            {meetings?.map((meeting) => (
              <MeetingListItem
                key={meeting.id}
                meeting={meeting}
                variant={tab === "upcoming" ? "upcoming" : "previous"}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
