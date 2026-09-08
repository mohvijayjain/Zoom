import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-zoom-blue text-white hover:bg-zoom-blue-hover",
  secondary: "bg-[#F5F5F7] text-zoom-text hover:bg-[#EBEBEF]",
  ghost: "bg-transparent text-zoom-blue hover:bg-zoom-sidebar-active",
  danger: "bg-[#E02D3C] text-white hover:bg-[#C0212F]",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-colors focus-visible:ring-2 focus-visible:ring-zoom-blue focus-visible:ring-offset-2",
        // Grey out and drop hover styles rather than just dimming opacity.
        "disabled:pointer-events-none disabled:bg-[#EBEBEF] disabled:text-[#A1A1AA]",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
