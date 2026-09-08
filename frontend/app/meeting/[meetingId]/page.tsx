"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { MeetingRoom } from "@/components/meeting/MeetingRoom";
import { PreJoinScreen } from "@/components/meeting/PreJoinScreen";
import { useMediaStream } from "@/hooks/useMediaStream";
import type { JoinResponse } from "@/lib/types";

/**
 * Owns the meeting session state.
 *
 * `useMediaStream` is instantiated here rather than inside PreJoinScreen: the
 * stream must survive the handoff into the room, and re-requesting it there
 * would re-prompt and blink the camera light.
 */
export default function MeetingPage() {
  const params = useParams<{ meetingId: string }>();
  const router = useRouter();
  const meetingId = typeof params.meetingId === "string" ? params.meetingId : "";

  const media = useMediaStream();

  const [session, setSession] = useState<{
    joined: JoinResponse;
    displayName: string;
  } | null>(null);

  function exit() {
    // Release the camera and mic before navigating, so the device light goes
    // out immediately rather than at unmount.
    media.stop();
    router.push("/");
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10">
        <PreJoinScreen
          meetingId={meetingId}
          media={media}
          onJoined={(joined, displayName) => setSession({ joined, displayName })}
        />
      </div>
    );
  }

  return (
    <MeetingRoom
      meeting={session.joined.meeting}
      participant={session.joined.participant}
      displayName={session.displayName}
      media={media}
      onExit={exit}
    />
  );
}
