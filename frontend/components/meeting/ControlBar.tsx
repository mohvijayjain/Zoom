"use client";

import {
  ControlButton,
  ControlMenuItem,
  ControlMenuLabel,
} from "@/components/meeting/ControlButton";
import type { MediaStreamController } from "@/hooks/useMediaStream";
import { updateParticipant } from "@/lib/api";
import {
  type ControlConfig,
  type ControlId,
  PANEL_TITLES,
  PLACEHOLDER_MENUS,
  type PanelId,
  controlsIn,
} from "@/lib/controls";
import type { DeviceList } from "@/lib/media";
import type { Participant } from "@/lib/types";

export type ControlBarProps = {
  participant: Participant;
  isHost: boolean;
  participantCount: number;
  media: MediaStreamController;
  devices: DeviceList;
  activePanel: PanelId | null;
  onTogglePanel: (panel: PanelId) => void;
  /** Opens the LeaveDialog, which owns the end/leave requests. */
  onRequestEnd: () => void;
  pushToast: (message: string) => void;
};

export function ControlBar({
  participant,
  isHost,
  participantCount,
  media,
  devices,
  activePanel,
  onTogglePanel,
  onRequestEnd,
  pushToast,
}: ControlBarProps) {
  /**
   * Flip locally first so the button responds instantly, then persist. On
   * failure, flip back and say so — a silently-wrong mic icon is worse than
   * a toast.
   */
  async function persistToggle(
    toggle: () => void,
    patch: { is_muted?: boolean; video_on?: boolean },
    failureMessage: string,
  ) {
    toggle();
    try {
      await updateParticipant(participant.id, patch);
    } catch {
      toggle();
      pushToast(failureMessage);
    }
  }

  function handleAudio() {
    // audioEnabled is the inverse of the stored is_muted flag.
    const nextEnabled = !media.audioEnabled;
    void persistToggle(
      media.toggleAudio,
      { is_muted: !nextEnabled },
      "Could not update your microphone.",
    );
  }

  function handleVideo() {
    const nextEnabled = !media.videoEnabled;
    void persistToggle(
      media.toggleVideo,
      { video_on: nextEnabled },
      "Could not update your camera.",
    );
  }

  function render(control: ControlConfig) {
    const toggledOff =
      (control.id === "audio" && !media.audioEnabled) ||
      (control.id === "video" && !media.videoEnabled);

    const Icon = toggledOff && control.activeIcon ? control.activeIcon : control.icon;
    const label =
      toggledOff && control.activeLabel ? control.activeLabel : control.label;

    const iconNode = (
      <Icon
        className={
          control.id === "share" ? "h-5 w-5 text-[#1B9E5A]" : "h-5 w-5"
        }
      />
    );

    switch (control.id) {
      case "audio":
      case "video": {
        const isAudio = control.id === "audio";
        const list = isAudio ? devices.microphones : devices.cameras;

        return (
          <ControlButton
            key={control.id}
            label={label}
            icon={iconNode}
            onClick={isAudio ? handleAudio : handleVideo}
            pressed={isAudio ? media.audioEnabled : media.videoEnabled}
            hasCaret={control.hasCaret}
            menu={
              <>
                <ControlMenuLabel>
                  {isAudio ? "Select a Microphone" : "Select a Camera"}
                </ControlMenuLabel>
                {list.length > 0 ? (
                  list.map((device, index) => (
                    <ControlMenuItem key={device.deviceId || index} checked={index === 0}>
                      {device.label || `${isAudio ? "Microphone" : "Camera"} ${index + 1}`}
                    </ControlMenuItem>
                  ))
                ) : (
                  <p className="px-3 py-1.5 text-[13px] text-white/40">
                    No devices detected
                  </p>
                )}
              </>
            }
          />
        );
      }

      case "participants":
      case "chat":
        return (
          <ControlButton
            key={control.id}
            label={control.label}
            icon={iconNode}
            badge={control.id === "participants" ? participantCount : undefined}
            pressed={activePanel === control.id}
            onClick={() => onTogglePanel(control.id as PanelId)}
            hasCaret={control.hasCaret}
            menu={
              <>
                <ControlMenuLabel>{PANEL_TITLES[control.id as PanelId]}</ControlMenuLabel>
                <ControlMenuItem onSelect={() => onTogglePanel(control.id as PanelId)}>
                  {activePanel === control.id ? "Close panel" : "Open panel"}
                </ControlMenuItem>
              </>
            }
          />
        );

      case "end":
        return (
          <ControlButton
            key={control.id}
            label={control.label}
            icon={iconNode}
            danger
            onClick={onRequestEnd}
          />
        );

      default: {
        // Placeholders: a plausible menu that no-ops on select.
        const options = PLACEHOLDER_MENUS[control.id as ControlId] ?? [];

        return (
          <ControlButton
            key={control.id}
            label={control.label}
            icon={iconNode}
            hasCaret={control.hasCaret}
            menuFromMain
            menu={
              <>
                <ControlMenuLabel>{control.label}</ControlMenuLabel>
                {options.map((option) => (
                  <ControlMenuItem key={option}>{option}</ControlMenuItem>
                ))}
              </>
            }
          />
        );
      }
    }
  }

  return (
    <div className="relative flex h-20 shrink-0 items-center border-t border-white/10 bg-[#151517] px-4">
        <div className="flex items-center gap-1">{controlsIn("left").map(render)}</div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
          {controlsIn("center").map(render)}
        </div>

        <div className="ml-auto flex items-center gap-1">
          {controlsIn("end").map(render)}
        </div>
    </div>
  );
}
