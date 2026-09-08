"use client";

import { cn } from "@/lib/utils";

export type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable day, as "YYYY-MM-DD". */
  min?: string;
  id?: string;
  invalid?: boolean;
  ariaLabel?: string;
};

export function DateField({
  value,
  onChange,
  min,
  id,
  invalid,
  ariaLabel = "Meeting date",
}: DateFieldProps) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      aria-label={ariaLabel}
      aria-invalid={invalid ? "true" : undefined}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "rounded-lg border bg-white px-3 py-2 text-sm text-zoom-text",
        "focus:outline-none focus:ring-2 focus:ring-zoom-blue",
        invalid ? "border-[#E02D3C]" : "border-zoom-border",
      )}
    />
  );
}
