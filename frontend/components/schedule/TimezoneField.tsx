"use client";

import { Select } from "@/components/ui/Select";
import { withZone } from "@/lib/timezones";

export type TimezoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TimezoneField({ value, onChange }: TimezoneFieldProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      // The browser's own zone may not be in the curated list.
      options={withZone(value)}
      ariaLabel="Time zone"
      className="w-full max-w-[340px]"
    />
  );
}
