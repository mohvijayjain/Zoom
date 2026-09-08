"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export type SidePanelProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Right-hand panel shell.
 *
 * A flex sibling of the video area, not an overlay — the grid shrinks to make
 * room rather than being covered.
 */
export function SidePanel({ title, onClose, children, footer }: SidePanelProps) {
  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-white/10 bg-[#242426]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

      {footer ? (
        <div className="shrink-0 border-t border-white/10 p-3">{footer}</div>
      ) : null}
    </aside>
  );
}
