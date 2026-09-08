"use client";

import { MeetingIdBadge } from "@/components/meeting/MeetingIdBadge";
import { Button } from "@/components/ui/Button";
import { CopyTextButton } from "@/components/ui/CopyTextButton";
import { Dialog } from "@/components/ui/Dialog";
import { buildInviteLink, buildInviteText } from "@/lib/invite";
import type { Meeting } from "@/lib/types";

export type InviteDialogProps = {
  meeting: Meeting;
  open: boolean;
  onClose: () => void;
  /**
   * Optional extra footer action. The dashboard uses it for "Start meeting",
   * so the invite can be shared *before* the host enters the room.
   */
  primaryAction?: { label: string; onClick: () => void };
};

export function InviteDialog({
  meeting,
  open,
  onClose,
  primaryAction,
}: InviteDialogProps) {
  const link = buildInviteLink(meeting.meeting_id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite people to your meeting"
      footer={
        <>
          <CopyTextButton label="Copy Invitation" text={() => buildInviteText(meeting)} />
          {primaryAction ? (
            <Button variant="primary" size="sm" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : null}
        </>
      }
    >
      <label className="block text-[13px] font-medium text-zoom-text" htmlFor="invite-link">
        Invite link
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          id="invite-link"
          readOnly
          value={link}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-zoom-border bg-white px-3 py-2 text-sm text-zoom-text"
        />
        <CopyTextButton label="Copy Link" text={link} />
      </div>

      <MeetingIdBadge meeting={meeting} className="mt-4" />

      <p className="mt-2 text-[13px] text-zoom-text-muted">
        Passcode: {meeting.passcode}
      </p>
    </Dialog>
  );
}
