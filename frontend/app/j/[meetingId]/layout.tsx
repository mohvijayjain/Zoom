import { ChevronDown } from "lucide-react";
import Link from "next/link";

const FOOTER_LINKS = [
  "Trust Center",
  "Acceptable Use Guidelines",
  "Legal & Compliance",
  "Do Not Sell My Personal Information",
  "Cookie Preferences",
];

/**
 * Chrome for the invite landing page — a stranger's first contact with the
 * app. They are not signed in and have no dashboard, so this route lives
 * outside the `(dashboard)` group and inherits none of its shell. The sidebar
 * isn't hidden here; it simply does not exist on this branch of the tree.
 *
 * `globals.css` puts `overflow: hidden` on `body` for the dashboard, so this
 * root owns its own scroll container or tall content would clip.
 */
export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-white">
      <header className="shrink-0 border-b border-zoom-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-bold leading-none tracking-tight text-zoom-blue"
          >
            ZOOM
          </Link>

          <div className="flex items-center gap-5 text-[13px] text-zoom-text">
            <span className="cursor-default">Support</span>
            <span className="flex cursor-default items-center gap-1">
              English
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 py-16">
        {children}
      </main>

      <footer className="shrink-0 border-t border-zoom-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          <p className="text-[13px] text-zoom-text-muted">
            Copyright &copy;2026 Zoom Communications, Inc. All rights reserved.
          </p>
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {FOOTER_LINKS.map((label) => (
              <li key={label} className="text-[13px] text-zoom-text-muted">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
