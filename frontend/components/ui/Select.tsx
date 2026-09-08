"use client";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  ariaLabel?: string;
  id?: string;
  className?: string;
};

/**
 * A real native <select> behind custom styling, so keyboard navigation and
 * the mobile picker come for free.
 */
export function Select({
  value,
  onChange,
  options,
  disabled,
  ariaLabel,
  id,
  className,
}: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full appearance-none rounded-lg border border-zoom-border bg-white",
          "py-2 pl-3 pr-9 text-sm text-zoom-text",
          "focus:outline-none focus:ring-2 focus:ring-zoom-blue",
          "disabled:cursor-not-allowed disabled:bg-[#F5F5F7] disabled:text-[#A1A1AA]",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zoom-text-muted"
      />
    </div>
  );
}
