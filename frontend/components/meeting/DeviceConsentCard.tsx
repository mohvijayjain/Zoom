"use client";

import { Loader2, Video } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { MediaAccessError } from "@/lib/media";

export type DeviceConsentCardProps = {
  requesting: boolean;
  error: MediaAccessError | null;
  /** Requests camera + mic, then advances. */
  onUseDevices: () => void;
  /** Skips the request entirely and advances with no stream. */
  onSkip: () => void;
};

const SKIP_LABEL = "Continue without microphone and camera";

export function DeviceConsentCard({
  requesting,
  error,
  onUseDevices,
  onSkip,
}: DeviceConsentCardProps) {
  return (
    <div className="w-full max-w-[640px] rounded-xl bg-[#2A2A2E] px-8 py-8 text-center">
      <div className="flex justify-center">
        <Illustration />
      </div>

      {error ? (
        <>
          <h1 className="mt-6 text-xl font-semibold text-white">
            {error.message}
          </h1>

          {error.kind === "denied" ? (
            // A second getUserMedia call will not re-prompt once blocked, so
            // saying "try again" alone would be a dead end.
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/60">
              Re-enable camera and microphone permission for this site from the
              icon in your browser&apos;s address bar, then try again.
            </p>
          ) : null}

          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={onUseDevices}
              disabled={requesting}
              className="h-11 px-6"
            >
              {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Try again"}
            </Button>
          </div>

          <SkipLink onSkip={onSkip} />
        </>
      ) : (
        <>
          <h1 className="mt-6 text-xl font-semibold text-white">
            Do you want people to see you in the meeting?
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/60">
            You can still turn off your microphone and camera anytime in the meeting
          </p>

          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={onUseDevices}
              disabled={requesting}
              className="h-11 px-6"
            >
              {requesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Use microphone and camera
                </>
              )}
            </Button>
          </div>

          <SkipLink onSkip={onSkip} />
        </>
      )}
    </div>
  );
}

function SkipLink({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="mx-auto mt-5 block text-sm text-[#4A85FF] underline-offset-2 hover:underline"
    >
      {SKIP_LABEL}
    </button>
  );
}

/** Stand-in for the reference illustration. */
function Illustration() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[195px] w-[225px] items-center justify-center rounded-xl bg-[#E8EEFA]"
    >
      <svg width="120" height="104" viewBox="0 0 120 104" fill="none">
        <rect x="8" y="20" width="76" height="56" rx="8" fill="#0B5CFF" />
        <path d="M92 34l20-12v56l-20-12V34z" fill="#4A85FF" />
        <circle cx="46" cy="42" r="11" fill="#E8EEFA" />
        <path
          d="M28 70c0-9.5 8-16 18-16s18 6.5 18 16"
          fill="#E8EEFA"
        />
        <rect x="20" y="86" width="80" height="6" rx="3" fill="#C7DAFF" />
      </svg>
    </div>
  );
}
