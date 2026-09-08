import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, letting later Tailwind utilities win over earlier ones.
 * Without twMerge, `cn("px-4", "px-2")` would emit both and the outcome would
 * depend on stylesheet order instead of call order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Copy text, reporting success rather than throwing.
 *
 * `navigator.clipboard` is absent over plain HTTP on a non-localhost host and
 * can reject when the document is not focused, so every caller needs the
 * same guard — hence one helper.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
