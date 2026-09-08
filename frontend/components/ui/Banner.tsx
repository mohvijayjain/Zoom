"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

export type BannerVariant = "success" | "warning" | "info";

export type BannerProps = {
  variant?: BannerVariant;
  message: ReactNode;
  /** Overrides the variant's default icon. */
  icon?: ReactNode;
  action?: { label: string; href: string };
  dismissible?: boolean;
  className?: string;
};

const VARIANTS: Record<BannerVariant, { wrapper: string; icon: string }> = {
  success: { wrapper: "border-[#BFE8CE] bg-[#F1FAF4]", icon: "text-[#1B7F45]" },
  warning: { wrapper: "border-[#F5DDA8] bg-[#FEF8EC]", icon: "text-[#B26B00]" },
  info: { wrapper: "border-[#C7DAFF] bg-zoom-sidebar-active", icon: "text-zoom-blue" },
};

const DEFAULT_ICONS: Record<BannerVariant, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

export function Banner({
  variant = "info",
  message,
  icon,
  action,
  dismissible = false,
  className,
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const styles = VARIANTS[variant];

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        styles.wrapper,
        className,
      )}
    >
      <span className={cn("mt-0.5 shrink-0", styles.icon)}>
        {icon ?? DEFAULT_ICONS[variant]}
      </span>

      <div className="flex-1 leading-relaxed text-zoom-text">
        {message}
        {action ? (
          <Link
            href={action.href}
            className="ml-2 font-medium text-zoom-blue underline-offset-2 hover:underline"
          >
            {action.label}
          </Link>
        ) : null}
      </div>

      {dismissible ? (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="-mr-1 shrink-0 rounded p-1 text-zoom-text-muted transition-colors hover:bg-black/5 hover:text-zoom-text"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
