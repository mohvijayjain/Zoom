"use client";

import { X } from "lucide-react";

import type { Toast } from "@/hooks/useToasts";

export type ToastStackProps = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

/** Device notices, stacked near the top of the video area. */
export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-20 flex w-full max-w-xl -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 rounded-lg bg-[#2A2A2E] px-4 py-3 shadow-lg"
        >
          <p className="flex-1 text-[13px] leading-relaxed text-white">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="-mr-1 -mt-0.5 shrink-0 rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
