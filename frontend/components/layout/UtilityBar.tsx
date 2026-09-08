import { Search } from "lucide-react";
import Link from "next/link";

import { UTILITY_LINKS } from "@/lib/constants";

/** The thin dark strip above the navbar. */
export function UtilityBar() {
  return (
    <div className="h-utilitybar w-full shrink-0 bg-zoom-dark text-utility text-white">
      <div className="flex h-full items-center justify-end gap-5 px-6">
        {UTILITY_LINKS.map((link) => (
          <div key={link.label} className="flex items-center gap-5">
            {link.dividerBefore ? (
              <span aria-hidden="true" className="h-4 w-px bg-white/25" />
            ) : null}

            <Link
              href={link.href}
              className="flex items-center gap-1.5 whitespace-nowrap text-white/90 transition-colors hover:text-white"
            >
              {link.icon === "search" ? <Search className="h-3.5 w-3.5" /> : null}
              {link.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
