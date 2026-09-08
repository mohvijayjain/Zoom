"use client";

import { ParticipantTile } from "@/components/meeting/ParticipantTile";
import type { Participant } from "@/lib/types";
import { cn } from "@/lib/utils";

export type VideoGridProps = {
  participants: Participant[];
  localStream: MediaStream | null;
  localParticipantId: number;
  localVideoEnabled: boolean;
};

/** Column count by participant count: 1, 2, 2x2, 3x3, then 4 wide + scroll. */
function gridColumns(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 9) return "grid-cols-3";
  return "grid-cols-4";
}

export function VideoGrid({
  participants,
  localStream,
  localParticipantId,
  localVideoEnabled,
}: VideoGridProps) {
  const count = participants.length;
  const isSolo = count <= 1;

  return (
    <div className="h-full w-full overflow-y-auto p-4">
      <div
        className={cn(
          "mx-auto grid h-full content-center gap-2",
          gridColumns(count),
          // Solo: a modest centred tile, not a stretched full-bleed panel.
          isSolo ? "max-w-[50%]" : "max-w-6xl",
        )}
      >
        {participants.map((participant) => {
          const isLocal = participant.id === localParticipantId;

          return (
            <ParticipantTile
              key={participant.id}
              participant={participant}
              isLocal={isLocal}
              stream={isLocal ? localStream : null}
              videoEnabled={isLocal ? localVideoEnabled : false}
              avatarClassName={
                isSolo ? "h-24 w-24 text-4xl" : count <= 4 ? "h-16 w-16 text-2xl" : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
