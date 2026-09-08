"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { copyToClipboard, cn } from "@/lib/utils";

export type CopyButtonProps = {
  /**
   * The text to copy. Pass a function when the value depends on `window`
   * (e.g. `location.origin`) so it is only read on click, never during SSR.
   */
  value: string | (() => string);
  label?: string;
  className?: string;
};

export function CopyButton({ value, label = "Copy invite link", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleCopy() {
    const text = typeof value === "function" ? value() : value;

    // Fails quietly when the clipboard API is unavailable.
    if (!(await copyToClipboard(text))) return;

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : label}
      title={label}
      className={cn(
        "rounded-md p-1.5 text-zoom-text-muted transition-colors",
        "hover:bg-black/[0.05] hover:text-zoom-text",
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-[#1B7F45]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
