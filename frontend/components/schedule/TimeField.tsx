"use client";

import { Select } from "@/components/ui/Select";
import { MERIDIEM_OPTIONS, TIME_OPTIONS, type Meridiem } from "@/lib/datetime";

export type TimeFieldProps = {
  time: string;
  meridiem: Meridiem;
  onTimeChange: (time: string) => void;
  onMeridiemChange: (meridiem: Meridiem) => void;
};

export function TimeField({
  time,
  meridiem,
  onTimeChange,
  onMeridiemChange,
}: TimeFieldProps) {
  return (
    <>
      <Select
        value={time}
        onChange={onTimeChange}
        options={TIME_OPTIONS}
        ariaLabel="Start time"
        className="w-[104px]"
      />
      <Select
        value={meridiem}
        onChange={(next) => onMeridiemChange(next as Meridiem)}
        options={MERIDIEM_OPTIONS}
        ariaLabel="AM or PM"
        className="w-[84px]"
      />
    </>
  );
}
