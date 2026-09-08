import { CopyButton } from "@/components/ui/CopyButton";
import type { Meeting } from "@/lib/types";
import { cn } from "@/lib/utils";

export type MeetingIdBadgeVariant = "light" | "dark";

export type MeetingIdBadgeProps = {
  meeting: Meeting;
  variant?: MeetingIdBadgeVariant;
  className?: string;
};

const STYLES: Record<MeetingIdBadgeVariant, { label: string; value: string; copy: string }> = {
  light: {
    label: "text-zoom-text-muted",
    value: "text-zoom-text",
    copy: "",
  },
  // The Phase 7 meeting room sits on --zoom-room-bg.
  dark: {
    label: "text-white/60",
    value: "text-white",
    copy: "text-white/70 hover:bg-white/10 hover:text-white",
  },
};

export function MeetingIdBadge({
  meeting,
  variant = "light",
  className,
}: MeetingIdBadgeProps) {
  const styles = STYLES[variant];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-[13px]", styles.label)}>Meeting ID</span>
      <span className={cn("text-sm font-medium tracking-wide", styles.value)}>
        {meeting.meeting_id_formatted}
      </span>
      {/* Copies the raw digits — what someone types into the Join field. */}
      <CopyButton
        value={meeting.meeting_id}
        label="Copy meeting ID"
        className={styles.copy}
      />
    </div>
  );
}
