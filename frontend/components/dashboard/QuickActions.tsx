"use client";

import { Calendar, Loader2, Plus, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { InviteDialog } from "@/components/meeting/InviteDialog";
import { Card } from "@/components/ui/Card";
import { ApiError, createInstantMeeting } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import { cn } from "@/lib/utils";

const TILE = "flex flex-1 flex-col items-center gap-2 rounded-lg px-2 py-3 transition-colors";
const ICON_SQUARE = "flex h-12 w-12 items-center justify-center rounded-xl";
const LABEL = "text-[13px] font-medium text-zoom-text";

export function QuickActions() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<Meeting | null>(null);

  async function handleHost() {
    setStarting(true);
    setError(null);

    try {
      // `true` = personal meeting room, matching the reference screenshots.
      const res = await createInstantMeeting(true);
      // Surface the invite link before entering the room — otherwise it only
      // ever exists in the API response.
      setInvite(res.meeting);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Could not start the meeting.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-stretch gap-2">
          <TileLink
            href="/meetings/schedule"
            icon={<Calendar className="h-6 w-6 text-white" />}
            iconClassName="bg-zoom-blue"
            label="Schedule"
          />

          <TileLink
            href="/join"
            icon={<Plus className="h-6 w-6 text-white" />}
            iconClassName="bg-zoom-blue"
            label="Join"
          />

          <button
            type="button"
            onClick={handleHost}
            disabled={starting}
            className={cn(
              TILE,
              "hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            <span className={cn(ICON_SQUARE, "bg-[#F26D21]")}>
              {starting ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Video className="h-6 w-6 text-white" />
              )}
            </span>
            <span className={LABEL}>Host</span>
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-center text-[13px] text-[#E02D3C]">
            {error}
          </p>
        ) : null}
      </Card>

      {invite ? (
        <InviteDialog
          meeting={invite}
          open
          onClose={() => setInvite(null)}
          primaryAction={{
            label: "Start meeting",
            onClick: () => router.push(`/meeting/${invite.meeting_id}`),
          }}
        />
      ) : null}
    </>
  );
}

function TileLink({
  href,
  icon,
  iconClassName,
  label,
}: {
  href: string;
  icon: ReactNode;
  iconClassName: string;
  label: string;
}) {
  return (
    <Link href={href} className={cn(TILE, "hover:bg-black/[0.03]")}>
      <span className={cn(ICON_SQUARE, iconClassName)}>{icon}</span>
      <span className={LABEL}>{label}</span>
    </Link>
  );
}
