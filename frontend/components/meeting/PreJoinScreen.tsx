"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DeviceConsentCard } from "@/components/meeting/DeviceConsentCard";
import { NameEntry } from "@/components/meeting/NameEntry";
import { Button } from "@/components/ui/Button";
import type { MediaStreamController } from "@/hooks/useMediaStream";
import { useMeeting } from "@/hooks/useMeeting";
import { ApiError, joinMeeting } from "@/lib/api";
import type { JoinResponse } from "@/lib/types";

type Step = "consent" | "name" | "joining";

export type PreJoinScreenProps = {
  meetingId: string;
  media: MediaStreamController;
  onJoined: (result: JoinResponse, displayName: string) => void;
};

export function PreJoinScreen({ meetingId, media, onJoined }: PreJoinScreenProps) {
  const { meeting, loading, error } = useMeeting(meetingId);

  const [step, setStep] = useState<Step>("consent");
  const [hasStream, setHasStream] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);

  if (loading) {
    return <Loader2 className="h-8 w-8 animate-spin text-white/70" />;
  }

  // Validate the meeting *before* asking for the camera — prompting for
  // devices for a meeting that does not exist is a poor experience.
  if (error?.status === 404) {
    return <Blocked message="That meeting ID isn't valid" />;
  }

  if (error) {
    return <Blocked message={error.detail} />;
  }

  if (!meeting) {
    return <Blocked message="That meeting ID isn't valid" />;
  }

  if (meeting.status === "ended" || ended) {
    return <Blocked message="This meeting has ended" />;
  }

  async function handleJoin(displayName: string) {
    setStep("joining");
    setJoinError(null);

    try {
      const result = await joinMeeting(meetingId, displayName);
      onJoined(result, displayName);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEnded(true);
        return;
      }

      setJoinError(
        err instanceof ApiError ? err.detail : "Could not join. Please try again.",
      );
      setStep("name");
    }
  }

  if (step === "consent") {
    return (
      <DeviceConsentCard
        requesting={media.requesting}
        error={media.error}
        onUseDevices={async () => {
          const stream = await media.start({ video: true, audio: true });
          // A rejection leaves `media.error` set, so stay on this card.
          if (stream) {
            setHasStream(true);
            setStep("name");
          }
        }}
        onSkip={() => {
          setHasStream(false);
          setStep("name");
        }}
      />
    );
  }

  return (
    <NameEntry
      stream={media.stream}
      videoEnabled={media.videoEnabled}
      audioEnabled={media.audioEnabled}
      hasStream={hasStream}
      joining={step === "joining"}
      error={joinError}
      onToggleVideo={media.toggleVideo}
      onToggleAudio={media.toggleAudio}
      onJoin={handleJoin}
    />
  );
}

function Blocked({ message }: { message: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-medium text-white">{message}</p>
      <Link href="/" className="mt-5 inline-block">
        <Button
          variant="secondary"
          size="md"
          className="bg-white/10 text-white hover:bg-white/20"
        >
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
