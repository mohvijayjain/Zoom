"use client";

import { MicOff } from "lucide-react";
import { useEffect, useRef } from "react";

import { Avatar } from "@/components/ui/Avatar";
import type { Participant } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ParticipantTileProps = {
  participant: Participant;
  /** Only the local participant has a stream to render. */
  stream?: MediaStream | null;
  isLocal?: boolean;
  videoEnabled?: boolean;
  /** Scales the fallback avatar with the tile. */
  avatarClassName?: string;
  className?: string;
};

export function ParticipantTile({
  participant,
  stream = null,
  isLocal = false,
  videoEnabled = false,
  avatarClassName,
  className,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideo = isLocal && Boolean(stream) && videoEnabled;

  // srcObject is a DOM property; React cannot set it from JSX.
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    element.srcObject = showVideo ? stream : null;

    return () => {
      element.srcObject = null;
    };
  }, [stream, showVideo]);

  const initial = participant.display_name.trim().charAt(0) || "?";

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-black",
        className,
      )}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover [transform:scaleX(-1)]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Avatar
            initial={initial}
            size="lg"
            className={cn("rounded-full", avatarClassName)}
          />
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex max-w-[85%] items-center gap-1.5 rounded bg-black/55 px-2 py-1">
        {participant.is_muted ? (
          <MicOff className="h-3.5 w-3.5 shrink-0 text-[#E02D3C]" />
        ) : null}
        <span className="truncate text-[13px] text-white">
          {participant.display_name}
        </span>
      </div>
    </div>
  );
}
