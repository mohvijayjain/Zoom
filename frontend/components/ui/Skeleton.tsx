import { cn } from "@/lib/utils";

export type SkeletonProps = {
  className?: string;
};

/** Pulsing placeholder block. Size it with `className`. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-[#EBEBEF]", className)}
    />
  );
}
