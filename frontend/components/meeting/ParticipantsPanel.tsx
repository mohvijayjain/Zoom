"use client";

import { useState } from "react";

import { InviteDialog } from "@/components/meeting/InviteDialog";
import { ParticipantRow } from "@/components/meeting/ParticipantRow";
import { SidePanel } from "@/components/meeting/SidePanel";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, removeParticipant, updateParticipant } from "@/lib/api";
import type { Meeting, Participant } from "@/lib/types";

export type ParticipantsPanelProps = {
  meeting: Meeting;
  /** The shared roster from MeetingRoom's single useParticipants instance. */
  participants: Participant[];
  localParticipantId: number;
  isHostViewer: boolean;
  onClose: () => void;
  refetch: () => void;
  pushToast: (message: string) => void;
};

export function ParticipantsPanel({
  meeting,
  participants,
  localParticipantId,
  isHostViewer,
  onClose,
  refetch,
  pushToast,
}: ParticipantsPanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<Participant | null>(null);
  const [removing, setRemoving] = useState(false);

  /**
   * Optimistic mute: the row flips immediately, then persists. On failure the
   * refetch pulls the server's (unchanged) truth back, which is the revert.
   */
  const [optimisticMutes, setOptimisticMutes] = useState<Record<number, boolean>>({});

  async function handleMute(participant: Participant) {
    const nextMuted = !participant.is_muted;
    setOptimisticMutes((current) => ({ ...current, [participant.id]: nextMuted }));

    try {
      await updateParticipant(participant.id, { is_muted: nextMuted });
    } catch (err) {
      pushToast(
        err instanceof ApiError
          ? err.detail
          : `Could not update ${participant.display_name}.`,
      );
    } finally {
      setOptimisticMutes((current) => {
        const next = { ...current };
        delete next[participant.id];
        return next;
      });
      refetch();
    }
  }

  async function handleConfirmRemoval() {
    if (!pendingRemoval) return;

    setRemoving(true);
    try {
      await removeParticipant(pendingRemoval.id);
      setPendingRemoval(null);
      refetch();
    } catch (err) {
      pushToast(
        err instanceof ApiError
          ? err.detail
          : `Could not remove ${pendingRemoval.display_name}.`,
      );
    } finally {
      setRemoving(false);
    }
  }

  // The backend already returns the host first.
  const rows = participants.map((participant) => {
    const pending = optimisticMutes[participant.id];
    return pending === undefined
      ? participant
      : { ...participant, is_muted: pending };
  });

  return (
    <>
      <SidePanel
        title={`Participants (${participants.length})`}
        onClose={onClose}
        footer={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setInviteOpen(true)}
            className="w-full bg-white/10 text-white hover:bg-white/20"
          >
            Invite
          </Button>
        }
      >
        <div className="py-1">
          {rows.map((participant) => (
            <ParticipantRow
              key={participant.id}
              participant={participant}
              isLocal={participant.id === localParticipantId}
              isHostViewer={isHostViewer}
              onMute={handleMute}
              onRemove={setPendingRemoval}
            />
          ))}
        </div>
      </SidePanel>

      <InviteDialog
        meeting={meeting}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <Dialog
        open={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        title="Remove participant"
        size="sm"
      >
        <p className="text-sm text-zoom-text">
          Remove {pendingRemoval?.display_name} from the meeting?
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setPendingRemoval(null)}
            disabled={removing}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleConfirmRemoval}
            disabled={removing}
          >
            {removing ? "Removing…" : "Remove"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
