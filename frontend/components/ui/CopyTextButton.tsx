"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/utils";

export type CopyTextButtonProps = {
  label: string;
  /** Pass a function when the value depends on `window` (SSR safety). */
  text: string | (() => string);
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
};

/**
 * Labelled copy button that swaps to a "Copied" confirmation.
 * The icon-only variant is `ui/CopyButton`; both share `copyToClipboard`.
 */
export function CopyTextButton({
  label,
  text,
  variant = "secondary",
  size = "sm",
  className,
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    const value = typeof text === "function" ? text() : text;
    if (!(await copyToClipboard(value))) return;

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant={variant} size={size} onClick={handleClick} className={className}>
      {copied ? (
        <>
          <Check className="h-4 w-4 text-[#1B7F45]" />
          Copied
        </>
      ) : (
        label
      )}
    </Button>
  );
}
