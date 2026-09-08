import { cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  initial: string;
  size?: AvatarSize;
  className?: string;
};

const SIZES: Record<AvatarSize, string> = {
  sm: "h-7 w-7 rounded-md text-xs",
  md: "h-9 w-9 rounded-lg text-sm",
  lg: "h-14 w-14 rounded-xl text-xl",
};

export function Avatar({ initial, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center",
        "bg-zoom-avatar font-bold uppercase leading-none text-white",
        SIZES[size],
        className,
      )}
    >
      {initial.trim().charAt(0)}
    </span>
  );
}
