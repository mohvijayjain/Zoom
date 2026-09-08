import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { UtilityBar } from "@/components/layout/UtilityBar";

/**
 * Shell for every dashboard-side route.
 *
 * `(dashboard)` is a route group: the parentheses keep it out of the URL, so
 * `/` and `/meetings/schedule` both get this chrome while the meeting room
 * lives outside the group and renders with none of it.
 *
 * Next keeps this layout mounted across navigation, so sidebar scroll position
 * survives a route change.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <UtilityBar />
      <Navbar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="scrollbar-thin min-w-0 flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
