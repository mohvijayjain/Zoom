import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { NAV_ACTIONS, NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="h-navbar w-full shrink-0 border-b border-zoom-border bg-white">
      <div className="flex h-full items-center gap-8 px-6">
        <Link
          href="/"
          className="text-2xl font-bold leading-none tracking-tight text-zoom-blue"
        >
          ZOOM
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="whitespace-nowrap text-sm text-zoom-text transition-colors hover:text-zoom-blue"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-6">
          {NAV_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="whitespace-nowrap text-sm text-zoom-text transition-colors hover:text-zoom-blue"
            >
              {action.label}
            </Link>
          ))}

          {/* Menu triggers — the dropdowns themselves are out of scope here. */}
          <button
            type="button"
            className="flex items-center gap-1 whitespace-nowrap text-sm text-zoom-text transition-colors hover:text-zoom-blue"
          >
            Host
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="flex items-center gap-1 whitespace-nowrap text-sm text-zoom-text transition-colors hover:text-zoom-blue"
          >
            Web App
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Avatar is a rounded square by default; the navbar wants a circle,
              and twMerge lets this className override the base radius. */}
          <Avatar initial="M" size="md" className="rounded-full" />
        </div>
      </div>
    </header>
  );
}
