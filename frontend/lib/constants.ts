/**
 * Static chrome content. The navbar and sidebar render from these arrays, so
 * adding a link is a data change rather than a JSX change.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type UtilityLink = {
  label: string;
  href: string;
  /** Renders a magnifier before the label. */
  icon?: "search";
  /** Draws a vertical rule to the left of this item. */
  dividerBefore?: boolean;
};

export type SidebarItem = {
  label: string;
  href: string;
  /** Groups items under an uppercase heading; a change of section emits it. */
  section?: string;
  isNew?: boolean;
  isExternal?: boolean;
};

export const UTILITY_LINKS: UtilityLink[] = [
  { label: "Search", href: "#", icon: "search" },
  { label: "Support", href: "#" },
  { label: "0008000503335", href: "#" },
  { label: "Contact Sales", href: "#", dividerBefore: true },
  { label: "Request a Demo", href: "#" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "Products", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Resources", href: "#" },
  { label: "Plans & Pricing", href: "#" },
];

/** Right-hand navbar actions that open a menu (chevron shown). */
export const NAV_ACTIONS: NavLink[] = [
  { label: "Schedule", href: "/meetings/schedule" },
  { label: "Join", href: "/join" },
];

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Home", href: "/" },

  { label: "AI", href: "#", section: "My Products", isNew: true, isExternal: true },
  { label: "Meetings", href: "/meetings", section: "My Products" },
  { label: "Recordings", href: "/recordings", section: "My Products" },
  { label: "Summaries", href: "/summaries", section: "My Products" },
  { label: "Hub", href: "#", section: "My Products", isNew: true, isExternal: true },
  { label: "Whiteboards", href: "#", section: "My Products", isExternal: true },
  { label: "Notes", href: "/notes", section: "My Products" },
  { label: "Clips", href: "#", section: "My Products", isExternal: true },
  { label: "Canvas", href: "#", section: "My Products", isExternal: true },
  { label: "Paper", href: "#", section: "My Products", isExternal: true },
  { label: "Sheets", href: "#", section: "My Products", isExternal: true },
  { label: "Slides", href: "#", section: "My Products", isExternal: true },
  { label: "Tasks", href: "#", section: "My Products", isExternal: true },
  { label: "Scheduler", href: "#", section: "My Products", isExternal: true },
  { label: "Discover More Products", href: "#", section: "My Products" },
];
