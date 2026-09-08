"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { useMeeting } from "@/hooks/useMeeting";

export default function InvitePage() {
  const params = useParams<{ meetingId: string }>();
  const router = useRouter();

  const meetingId = typeof params.meetingId === "string" ? params.meetingId : null;
  const { meeting, loading, error, refetch } = useMeeting(meetingId);

  if (loading) {
    return (
      <div className="flex w-full max-w-md justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-zoom-text-muted" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-center text-3xl font-semibold text-zoom-text">
        Join meeting
      </h1>

      <div className="mt-8">
        {error?.status === 404 ? (
          <Notice
            message="That meeting ID isn't valid"
            detail={meetingId ? `You tried: ${meetingId}` : undefined}
            action={<DifferentIdButton />}
          />
        ) : error?.status === 0 ? (
          <Notice
            message="Could not reach the server"
            detail="Check your connection and try again."
            action={
              <Button variant="secondary" size="md" onClick={refetch} className="w-full">
                Try again
              </Button>
            }
          />
        ) : error || !meeting ? (
          <Notice
            message="Something went wrong"
            detail={error?.detail}
            action={<DifferentIdButton />}
          />
        ) : meeting.status === "ended" ? (
          <Notice message="This meeting has ended" action={<DifferentIdButton />} />
        ) : (
          <div>
            {/* Confirm what they're about to join before they commit. */}
            <div className="text-center">
              <p className="truncate text-sm font-medium text-zoom-text">
                {meeting.topic}
              </p>
              <p className="mt-1 text-[13px] text-zoom-text-muted">
                Meeting ID: {meeting.meeting_id_formatted}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {/* Visual placeholder for the desktop-app handoff. */}
              <Button
                variant="primary"
                size="md"
                title="Opens the desktop app"
                className="h-11 w-full"
              >
                Join from Zoom Workplace app
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => router.push(`/meeting/${meeting.meeting_id}`)}
                className="h-11 w-full border border-zoom-border bg-white hover:bg-[#F5F5F7]"
              >
                Join from browser
              </Button>
            </div>

            <p className="mt-6 text-center text-[13px] leading-relaxed text-zoom-text-muted">
              Don&apos;t have the Zoom Workplace app installed?{" "}
              <span className="cursor-default text-zoom-blue">Download Now</span>
            </p>

            <p className="mt-4 text-center text-xs leading-relaxed text-zoom-text-muted">
              By joining a meeting, you agree to our{" "}
              <span className="cursor-default text-zoom-blue">Terms of Service</span> and{" "}
              <span className="cursor-default text-zoom-blue">Privacy Statement</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Notice({
  message,
  detail,
  action,
}: {
  message: string;
  detail?: string;
  action: React.ReactNode;
}) {
  return (
    <div>
      <div className="rounded-lg border border-zoom-border bg-white px-4 py-5 text-center">
        <p className="text-sm font-medium text-zoom-text">{message}</p>
        {detail ? (
          <p className="mt-1 break-all text-[13px] text-zoom-text-muted">{detail}</p>
        ) : null}
      </div>
      <div className="mt-4">{action}</div>
    </div>
  );
}

function DifferentIdButton() {
  return (
    <Link href="/join" className="block">
      <Button variant="secondary" size="md" className="w-full">
        Enter a different ID
      </Button>
    </Link>
  );
}
