import { type HTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** The container every dashboard panel sits in. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("rounded-lg border border-zoom-border bg-white p-6", className)}
      {...props}
    />
  );
});
