"use client";

import { Info, LayoutGrid, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { InviteDialog } from "@/components/meeting/InviteDialog";
import type { Meeting } from "@/lib/types";

export type MeetingHeaderProps = {
  meeting: Meeting;
};

export function MeetingHeader({ meeting }: MeetingHeaderProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 bg-[#242426] px-4">
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label="Meeting information"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Info className="h-4 w-4" />
        </button>

        <h1 className="truncate text-sm font-semibold text-white">{meeting.topic}</h1>

        {/* Tight cluster on the right, matching the reference spacing. */}
        <div className="ml-auto flex items-center gap-2">
          <ShieldCheck
            className="h-4 w-4 text-[#1B9E5A]"
            aria-label="Encryption enabled"
          />
          <span aria-hidden="true" className="h-4 w-px bg-white/20" />
          <LayoutGrid className="h-4 w-4 text-white/70" aria-label="Change view" />
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px] font-semibold text-white">
            zm
          </span>
        </div>
      </header>

      <InviteDialog
        meeting={meeting}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </>
  );
}
