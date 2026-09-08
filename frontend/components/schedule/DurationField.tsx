"use client";

import { Select } from "@/components/ui/Select";
import { DURATION_HOUR_OPTIONS, DURATION_MINUTE_OPTIONS } from "@/lib/datetime";

export type DurationFieldProps = {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
};

export function DurationField({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}: DurationFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={String(hours)}
        onChange={(next) => onHoursChange(Number(next))}
        options={DURATION_HOUR_OPTIONS}
        ariaLabel="Duration hours"
        className="w-[76px]"
      />
      <span className="text-sm text-zoom-text">hr</span>

      <Select
        value={String(minutes)}
        onChange={(next) => onMinutesChange(Number(next))}
        options={DURATION_MINUTE_OPTIONS}
        ariaLabel="Duration minutes"
        className="w-[76px]"
      />
      <span className="text-sm text-zoom-text">min</span>
    </div>
  );
}
