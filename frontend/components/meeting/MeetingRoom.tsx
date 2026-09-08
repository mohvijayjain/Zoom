"use client";

import { useEffect, useRef, useState } from "react";

import { ChatPanel } from "@/components/meeting/ChatPanel";
import { ControlBar } from "@/components/meeting/ControlBar";
import { LeaveDialog } from "@/components/meeting/LeaveDialog";
import { MeetingHeader } from "@/components/meeting/MeetingHeader";
import { ParticipantsPanel } from "@/components/meeting/ParticipantsPanel";
import { ToastStack } from "@/components/meeting/ToastStack";
import { VideoGrid } from "@/components/meeting/VideoGrid";
import type { MediaStreamController } from "@/hooks/useMediaStream";
import { useParticipants } from "@/hooks/useParticipants";
import { useToasts } from "@/hooks/useToasts";
import type { PanelId } from "@/lib/controls";
import { type DeviceList, listDevices } from "@/lib/media";
import type { Meeting, Participant } from "@/lib/types";

const NO_DEVICES: DeviceList = { cameras: [], microphones: [], speakers: [] };
const EXIT_NOTICE_MS = 2500;

export type MeetingRoomProps = {
  meeting: Meeting;
  participant: Participant;
  displayName: string;
  media: MediaStreamController;
  /** Stops the stream and navigates home. */
  onExit: () => void;
};

export function MeetingRoom({
  meeting,
  participant,
  displayName,
  media,
  onExit,
}: MeetingRoomProps) {
  const { toasts, push, dismiss } = useToasts();

  // ONE poll for the whole room. VideoGrid and ParticipantsPanel both read
  // this instance — a second would double the request rate and the two copies
  // could disagree mid-poll.
  const { participants, refetch, lastSyncedAt } = useParticipants(meeting.meeting_id, [
    participant,
  ]);

  const [devices, setDevices] = useState<DeviceList>(NO_DEVICES);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [exitNotice, setExitNotice] = useState<string | null>(null);

  const localParticipant =
    participants.find((row) => row.id === participant.id) ?? participant;

  /**
   * Detect being removed, or the host ending the meeting.
   *
   * Gated on `lastSyncedAt` so only a *successful* poll can eject: otherwise
   * one failed request — which leaves the roster untouched — would throw
   * everybody out.
   */
  useEffect(() => {
    if (lastSyncedAt === null || exitNotice) return;
    if (participants.some((row) => row.id === participant.id)) return;

    // An empty roster means every left_at was stamped at once, which is what
    // ending the meeting does; otherwise this one participant was removed.
    setExitNotice(
      participants.length === 0
        ? "The host ended this meeting."
        : "You were removed from the meeting.",
    );
  }, [lastSyncedAt, participants, participant.id, exitNotice]);

  useEffect(() => {
    if (!exitNotice) return;

    // Release the camera immediately; let the notice sit for a moment so it
    // is actually readable before the route changes.
    media.stop();
    const timer = setTimeout(onExit, EXIT_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [exitNotice, media, onExit]);

  // Device notices. Labels are empty without permission, in which case we say
  // nothing rather than inventing a device name.
  const announced = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void listDevices().then((found) => {
      if (cancelled) return;
      setDevices(found);

      if (announced.current) return;
      announced.current = true;

      const microphone = found.microphones.find((device) => device.label)?.label;
      if (microphone) {
        push(
          `Your default microphone has changed to ${microphone} and will now be used.`,
        );
      }

      const speaker = found.speakers.find((device) => device.label)?.label;
      if (speaker) {
        push(`Your default speaker has changed to ${speaker} and will now be used.`);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [push]);

  if (exitNotice) {
    return (
      <div className="flex h-screen items-center justify-center bg-zoom-room-bg px-6">
        <p role="status" className="text-lg font-medium text-white">
          {exitNotice}
        </p>
      </div>
    );
  }

  return (
    // min-h-0 on the middle row is required, or the grid grows past the
    // viewport instead of shrinking to the space left over.
    <div className="flex h-screen flex-col bg-zoom-room-bg">
      <MeetingHeader meeting={meeting} />

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <ToastStack toasts={toasts} onDismiss={dismiss} />
          <VideoGrid
            participants={participants}
            localStream={media.stream}
            localParticipantId={participant.id}
            localVideoEnabled={media.videoEnabled}
          />
        </div>

        {/* Flex siblings, so the grid shrinks rather than being overlapped. */}
        {activePanel === "participants" ? (
          <ParticipantsPanel
            meeting={meeting}
            participants={participants}
            localParticipantId={participant.id}
            isHostViewer={localParticipant.is_host}
            onClose={() => setActivePanel(null)}
            refetch={refetch}
            pushToast={push}
          />
        ) : null}

        {activePanel === "chat" ? (
          <ChatPanel displayName={displayName} onClose={() => setActivePanel(null)} />
        ) : null}
      </div>

      <ControlBar
        participant={localParticipant}
        isHost={localParticipant.is_host}
        participantCount={participants.length}
        media={media}
        devices={devices}
        activePanel={activePanel}
        onTogglePanel={(panel) =>
          setActivePanel((current) => (current === panel ? null : panel))
        }
        onRequestEnd={() => setLeaveOpen(true)}
        pushToast={push}
      />

      <LeaveDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        isHost={localParticipant.is_host}
        meetingId={meeting.meeting_id}
        localParticipantId={participant.id}
        onExit={onExit}
      />
    </div>
  );
}
