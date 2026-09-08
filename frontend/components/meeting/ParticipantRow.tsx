"use client";

import { Mic, MicOff, MoreHorizontal, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import type { Participant } from "@/lib/types";

export type ParticipantRowProps = {
  participant: Participant;
  isLocal: boolean;
  /** True when the *viewer* is the host, which unlocks the row menu. */
  isHostViewer: boolean;
  onMute: (participant: Participant) => void;
  onRemove: (participant: Participant) => void;
};

export function ParticipantRow({
  participant,
  isLocal,
  isHostViewer,
  onMute,
  onRemove,
}: ParticipantRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // The host cannot act on their own row.
  const canManage = isHostViewer && !isLocal;

  return (
    <div
      ref={wrapperRef}
      className="group relative flex items-center gap-3 px-4 py-2 hover:bg-white/[0.04]"
    >
      <Avatar
        initial={participant.display_name.trim().charAt(0) || "?"}
        size="sm"
        className="rounded-full"
      />

      <p className="min-w-0 flex-1 truncate text-[13px] text-white">
        {participant.display_name}
        {participant.is_host ? <span className="text-white/50"> (Host)</span> : null}
        {isLocal ? <span className="text-white/50"> (you)</span> : null}
      </p>

      {canManage ? (
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={`Manage ${participant.display_name}`}
          aria-expanded={menuOpen}
          // Revealed on hover, but kept reachable by keyboard focus.
          className="rounded p-1 text-white/70 opacity-0 transition-opacity hover:bg-white/10 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      ) : null}

      {/* Display-only device state. */}
      <span className="flex shrink-0 items-center gap-2">
        {participant.is_muted ? (
          <MicOff className="h-3.5 w-3.5 text-[#E02D3C]" aria-label="Muted" />
        ) : (
          <Mic className="h-3.5 w-3.5 text-white/60" aria-label="Unmuted" />
        )}
        {participant.video_on ? (
          <Video className="h-3.5 w-3.5 text-white/60" aria-label="Video on" />
        ) : (
          <VideoOff className="h-3.5 w-3.5 text-[#E02D3C]" aria-label="Video off" />
        )}
      </span>

      {menuOpen && canManage ? (
        <div
          role="menu"
          className="absolute right-8 top-9 z-30 w-44 rounded-lg border border-white/10 bg-[#2A2A2E] py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              onMute(participant);
            }}
            className="block w-full px-3 py-1.5 text-left text-[13px] text-white transition-colors hover:bg-white/10"
          >
            {participant.is_muted ? "Ask to Unmute" : "Mute"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              onRemove(participant);
            }}
            className="block w-full px-3 py-1.5 text-left text-[13px] text-[#FF8A93] transition-colors hover:bg-white/10"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}
