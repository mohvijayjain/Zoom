"use client";

import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { VideoPreview } from "@/components/meeting/VideoPreview";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 120;

export type NameEntryProps = {
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  hasStream: boolean;
  joining: boolean;
  error: string | null;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onJoin: (displayName: string) => void;
};

export function NameEntry({
  stream,
  videoEnabled,
  audioEnabled,
  hasStream,
  joining,
  error,
  onToggleVideo,
  onToggleAudio,
  onJoin,
}: NameEntryProps) {
  const inputId = useId();
  const { data: user } = useCurrentUser();

  const [name, setName] = useState("");
  const [edited, setEdited] = useState(false);

  // Prefill from the signed-in user once, and never clobber typing already
  // in progress if the request resolves late.
  useEffect(() => {
    if (user?.name && !edited && name === "") setName(user.name);
  }, [user?.name, edited, name]);

  const trimmed = name.trim();
  const canJoin = trimmed.length > 0 && !joining;

  return (
    <div className="w-full max-w-[420px]">
      <VideoPreview
        stream={stream}
        videoEnabled={videoEnabled}
        avatarInitial={trimmed.charAt(0) || user?.avatar_initial || "?"}
      />

      {/* Lets the user arrive muted / camera-off. */}
      <div className="mt-3 flex justify-center gap-2">
        <DeviceToggle
          active={audioEnabled}
          disabled={!hasStream}
          onClick={onToggleAudio}
          label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
          icon={audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        />
        <DeviceToggle
          active={videoEnabled}
          disabled={!hasStream}
          onClick={onToggleVideo}
          label={videoEnabled ? "Stop video" : "Start video"}
          icon={
            videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />
          }
        />
      </div>

      {!hasStream ? (
        <p className="mt-3 text-center text-[13px] text-white/50">
          Joining without microphone and camera
        </p>
      ) : null}

      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (canJoin) onJoin(trimmed);
        }}
      >
        <label htmlFor={inputId} className="block text-sm text-white/80">
          Your Name
        </label>
        <input
          id={inputId}
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(event) => {
            setEdited(true);
            setName(event.target.value);
          }}
          placeholder="Enter your name"
          autoComplete="name"
          className={cn(
            "mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5",
            "text-sm text-white placeholder:text-white/40",
            "focus:outline-none focus:ring-2 focus:ring-zoom-blue",
          )}
        />

        {error ? (
          <p role="alert" className="mt-2 text-[13px] text-[#FF8A93]">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canJoin}
          className="mt-4 h-11 w-full"
        >
          {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
        </Button>
      </form>
    </div>
  );
}

function DeviceToggle({
  active,
  disabled,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-[#E02D3C] text-white hover:bg-[#C0212F]",
      )}
    >
      {icon}
    </button>
  );
}
