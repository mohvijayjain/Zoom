"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { CopyTextButton } from "@/components/ui/CopyTextButton";
import {
  formatDuration,
  formatMeetingDay,
  formatRelative,
  formatTimeOfDay,
} from "@/lib/format";
import { buildInviteText } from "@/lib/invite";
import type { Meeting } from "@/lib/types";

export type MeetingListItemProps = {
  meeting: Meeting;
  variant: "upcoming" | "previous";
};

export function MeetingListItem({ meeting, variant }: MeetingListItemProps) {
  const router = useRouter();
  const start = meeting.scheduled_start;

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-zoom-border py-4 last:border-b-0">
      {/* Day label above the clock time — pairing formatMeetingDay with the
          full formatMeetingTime would print the date twice. */}
      <div className="w-32 shrink-0">
        <p className="text-sm font-medium text-zoom-text">
          {start ? formatMeetingDay(start, meeting.timezone) : "—"}
        </p>
        <p className="mt-0.5 text-[13px] text-zoom-text-muted">
          {start ? formatTimeOfDay(start, meeting.timezone) : ""}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zoom-text">{meeting.topic}</p>
        <p className="mt-0.5 text-[13px] text-zoom-text-muted">
          {meeting.meeting_id_formatted} · {formatDuration(meeting.duration_min)}
        </p>
      </div>

      {variant === "upcoming" ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/meeting/${meeting.meeting_id}`)}
          >
            Start
          </Button>
          <CopyTextButton
            label="Copy Invitation"
            text={() => buildInviteText(meeting)}
          />
        </div>
      ) : (
        <p className="shrink-0 text-[13px] text-zoom-text-muted">
          {meeting.ended_at ? formatRelative(meeting.ended_at) : "Ended"}
        </p>
      )}
    </li>
  );
}
