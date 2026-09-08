import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-4 py-10 text-center", className)}>
      {icon ? <span className="text-zoom-text-muted">{icon}</span> : null}
      <p className="text-sm font-medium text-zoom-text">{title}</p>
      {description ? (
        <p className="max-w-sm text-[13px] leading-relaxed text-zoom-text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
  className?: string;
};

/**
 * The failure counterpart to EmptyState. Lives here because every data-backed
 * section needs both, and keeping them together avoids four copies of this.
 */
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2 py-4", className)}>
      <p className="text-[13px] text-zoom-text-muted">
        {message ?? "Could not load this right now."}
      </p>
      <Button variant="ghost" size="sm" onClick={onRetry} className="-ml-3">
        Retry
      </Button>
    </div>
  );
}
