"use client";

import { ChevronUp } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type ControlButtonProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  /** Toggle state — emits aria-pressed when provided. */
  pressed?: boolean;
  /** Red styling for the End control. */
  danger?: boolean;
  /** Live count badge, e.g. participants. */
  badge?: number;
  ariaLabel?: string;
  /** Menu contents, shown above the bar. */
  menu?: ReactNode;
  /** Renders a separate chevron hit area that opens the menu. */
  hasCaret?: boolean;
  /**
   * Opens the menu from the main button instead of the caret — how the
   * placeholder controls behave, since they have nothing else to do.
   */
  menuFromMain?: boolean;
};

export function ControlButton({
  label,
  icon,
  onClick,
  pressed,
  danger,
  badge,
  ariaLabel,
  menu,
  hasCaret,
  menuFromMain,
}: ControlButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const showsMenu = Boolean(menu);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (showsMenu && menuFromMain) {
            setOpen((previous) => !previous);
            return;
          }
          onClick?.();
        }}
        aria-label={ariaLabel ?? label}
        aria-pressed={pressed}
        aria-expanded={showsMenu && menuFromMain ? open : undefined}
        className={cn(
          "flex w-16 flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors",
          danger
            ? "bg-[#E02D3C] text-white hover:bg-[#C0212F]"
            : "text-white hover:bg-white/10",
        )}
      >
        <span className="relative">
          {icon}
          {typeof badge === "number" ? (
            <span className="absolute -right-2 -top-1.5 min-w-[16px] rounded-full bg-zoom-blue px-1 text-[10px] font-semibold leading-4 text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="text-[11px] leading-none">{label}</span>
      </button>

      {hasCaret && showsMenu ? (
        // A distinct hit area from the main button — exactly how Zoom behaves.
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={`${label} options`}
          aria-expanded={open}
          className="absolute -right-0.5 top-0.5 rounded p-0.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
      ) : null}

      {open && showsMenu ? (
        <div
          role="menu"
          className="absolute bottom-full left-1/2 z-30 mb-3 w-64 -translate-x-1/2 rounded-lg border border-white/10 bg-[#2A2A2E] py-2 shadow-xl"
        >
          {menu}
        </div>
      ) : null}
    </div>
  );
}

/** Section heading inside a control menu, e.g. "Select a Microphone". */
export function ControlMenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
      {children}
    </p>
  );
}

export function ControlMenuItem({
  children,
  checked,
  onSelect,
}: {
  children: ReactNode;
  checked?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-white transition-colors hover:bg-white/10"
    >
      <span className="w-3 shrink-0 text-zoom-blue">{checked ? "✓" : ""}</span>
      <span className="truncate">{children}</span>
    </button>
  );
}
