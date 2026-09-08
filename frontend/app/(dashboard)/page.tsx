import { PersonalMeetingCard } from "@/components/dashboard/PersonalMeetingCard";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingMeetings } from "@/components/dashboard/UpcomingMeetings";

/**
 * Composition only — every section owns its own data and states.
 *
 * No `min-h-screen` and no `overflow-*` here: the (dashboard) shell already
 * owns the single scroll container, and adding one nests a second scrollbar.
 */
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex min-w-0 flex-col gap-6">
        <ProfileCard />
        <RecentActivity />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <QuickActions />
        <PersonalMeetingCard />
        <UpcomingMeetings />
      </div>
    </div>
  );
}
