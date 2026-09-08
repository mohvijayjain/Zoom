"use client";

import { useEffect, useRef } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export type VideoPreviewProps = {
  stream: MediaStream | null;
  videoEnabled: boolean;
  displayName?: string;
  avatarInitial?: string;
  className?: string;
};

export function VideoPreview({
  stream,
  videoEnabled,
  displayName,
  avatarInitial,
  className,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideo = Boolean(stream) && videoEnabled;

  // `srcObject` is a DOM property, not an attribute — React cannot set it from
  // JSX, so it has to be assigned imperatively.
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    element.srcObject = showVideo ? stream : null;

    return () => {
      // Detach on teardown; stopping tracks is the hook's job, not ours.
      element.srcObject = null;
    };
  }, [stream, showVideo]);

  const initial = avatarInitial ?? displayName?.trim().charAt(0) ?? "?";

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
          // Mirrored, like every video app — an unmirrored self-view reads as
          // broken immediately.
          className="h-full w-full object-cover [transform:scaleX(-1)]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Avatar initial={initial} size="lg" />
        </div>
      )}

      {displayName ? (
        <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-black/55 px-2 py-1 text-[13px] text-white">
          {displayName}
        </span>
      ) : null}
    </div>
  );
}
