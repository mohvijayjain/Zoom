"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SIDEBAR_ITEMS, type SidebarItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Home matches exactly; every other route also matches its sub-routes. */
function isActive(pathname: string, href: string): boolean {
  if (href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="scrollbar-thin h-full w-sidebar shrink-0 overflow-y-auto border-r border-zoom-border bg-[#FAFAFB]">
      <nav className="px-3 py-4">
        {SIDEBAR_ITEMS.map((item, index) => {
          // A change of section emits its uppercase heading once.
          const previousSection = SIDEBAR_ITEMS[index - 1]?.section;
          const startsSection = Boolean(item.section) && item.section !== previousSection;

          return (
            <div key={item.label}>
              {startsSection ? (
                <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-zoom-text-muted">
                  {item.section}
                </p>
              ) : null}

              <SidebarLink item={item} active={isActive(pathname, item.href)} />
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: SidebarItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      target={item.isExternal ? "_blank" : undefined}
      rel={item.isExternal ? "noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-zoom-sidebar-active font-medium text-zoom-blue"
          : "text-zoom-text hover:bg-black/[0.04]",
      )}
    >
      <span className="truncate">{item.label}</span>

      {item.isNew ? (
        <span className="shrink-0 rounded bg-zoom-blue px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-white">
          New
        </span>
      ) : null}

      {item.isExternal ? (
        <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-zoom-text-muted" />
      ) : null}
    </Link>
  );
}
