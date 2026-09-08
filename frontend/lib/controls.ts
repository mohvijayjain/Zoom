/**
 * Control-bar configuration.
 *
 * The bar renders from this array rather than from nine hardcoded blocks, so
 * adding or reordering a control is a data change.
 */

import {
  Heart,
  type LucideIcon,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from "lucide-react";

export type ControlId =
  | "audio"
  | "video"
  | "participants"
  | "chat"
  | "react"
  | "share"
  | "more"
  | "end";

/** Where the control sits in the bar's three-part layout. */
export type ControlGroup = "left" | "center" | "end";

export type ControlConfig = {
  id: ControlId;
  group: ControlGroup;
  /** Icon and label for the control's default ("on") state. */
  label: string;
  icon: LucideIcon;
  /**
   * Icon and label for the toggled ("off") state — muted, or video stopped.
   * Only the audio and video controls have these.
   */
  activeIcon?: LucideIcon;
  activeLabel?: string;
  /** Renders a separate chevron hit area that opens a menu. */
  hasCaret?: boolean;
  /** Looks complete, does nothing — opens a no-op menu. */
  isPlaceholder?: boolean;
};

export const CONTROLS: ControlConfig[] = [
  {
    id: "audio",
    group: "left",
    label: "Mute",
    icon: Mic,
    activeLabel: "Unmute",
    activeIcon: MicOff,
    hasCaret: true,
  },
  {
    id: "video",
    group: "left",
    label: "Stop Video",
    icon: Video,
    activeLabel: "Start Video",
    activeIcon: VideoOff,
    hasCaret: true,
  },
  { id: "participants", group: "center", label: "Participants", icon: Users, hasCaret: true },
  { id: "chat", group: "center", label: "Chat", icon: MessageSquare, hasCaret: true },
  { id: "react", group: "center", label: "React", icon: Heart, isPlaceholder: true },
  {
    id: "share",
    group: "center",
    label: "Share",
    icon: MonitorUp,
    hasCaret: true,
    isPlaceholder: true,
  },
  { id: "more", group: "center", label: "More", icon: MoreHorizontal, isPlaceholder: true },
  { id: "end", group: "end", label: "End", icon: PhoneOff },
];

export function controlsIn(group: ControlGroup): ControlConfig[] {
  return CONTROLS.filter((control) => control.group === group);
}

/** Menu contents for the placeholder controls — plausible, and inert. */
export const PLACEHOLDER_MENUS: Partial<Record<ControlId, string[]>> = {
  share: ["Screen", "Window", "Whiteboard"],
  more: ["Settings", "Record", "Live Transcript"],
  react: ["Clap", "Thumbs Up", "Heart"],
};

/** Side panels the participants / chat controls toggle. */
export type PanelId = "participants" | "chat";

export const PANEL_TITLES: Record<PanelId, string> = {
  participants: "Participants",
  chat: "Chat",
};
