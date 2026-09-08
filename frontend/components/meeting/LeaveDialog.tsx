"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, endMeeting, removeParticipant } from "@/lib/api";

export type LeaveDialogProps = {
  open: boolean;
  onClose: () => void;
  isHost: boolean;
  meetingId: string;
  localParticipantId: number;
  /** Stops the media stream and navigates home. */
  onExit: () => void;
};

type Pending = "leave" | "end" | null;

export function LeaveDialog({
  open,
  onClose,
  isHost,
  meetingId,
  localParticipantId,
  onExit,
}: LeaveDialogProps) {
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: Exclude<Pending, null>, request: () => Promise<unknown>) {
    setPending(kind);
    setError(null);

    try {
      await request();
      onExit();
    } catch (err) {
      // Never trap someone in a meeting because a request failed — report it
      // and still offer the local exit.
      setError(
        err instanceof ApiError ? err.detail : "Something went wrong. Please try again.",
      );
      setPending(null);
    }
  }

  const busy = pending !== null;

  return (
    <Dialog
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={isHost ? "End meeting" : "Leave meeting"}
      size="sm"
    >
      <p className="text-sm text-zoom-text-muted">
        {isHost
          ? "End the meeting for everyone, or leave and let it continue without you."
          : "You will be returned to the home page."}
      </p>

      {error ? (
        <div className="mt-3 rounded-lg border border-[#F3C0C5] bg-[#FDF2F3] px-3 py-2">
          <p role="alert" className="text-[13px] text-[#B0212E]">
            {error}
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-1 text-[13px] font-medium text-zoom-blue underline-offset-2 hover:underline"
          >
            Leave anyway
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        {isHost ? (
          <Button
            variant="danger"
            size="md"
            disabled={busy}
            onClick={() => run("end", () => endMeeting(meetingId))}
            className="w-full"
          >
            {pending === "end" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "End Meeting for Everyone"
            )}
          </Button>
        ) : null}

        <Button
          // The only action for a guest, so it carries the danger styling there.
          variant={isHost ? "secondary" : "danger"}
          size="md"
          disabled={busy}
          onClick={() => run("leave", () => removeParticipant(localParticipantId))}
          className="w-full"
        >
          {pending === "leave" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Leave Meeting"
          )}
        </Button>

        <Button variant="ghost" size="md" disabled={busy} onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
