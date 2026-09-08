/**
 * getUserMedia wrapper. Components never touch `navigator.mediaDevices`
 * directly, so every failure arrives already classified.
 */

export type MediaErrorKind =
  | "denied"
  | "not-found"
  | "in-use"
  | "insecure"
  | "unsupported"
  | "unknown";

export class MediaAccessError extends Error {
  readonly kind: MediaErrorKind;

  constructor(kind: MediaErrorKind, message: string) {
    super(message);
    this.name = "MediaAccessError";
    this.kind = kind;
  }
}

const MESSAGES: Record<MediaErrorKind, string> = {
  denied: "Camera and microphone access was blocked.",
  "not-found": "No camera or microphone was found.",
  "in-use": "Your camera or microphone is already in use by another app.",
  insecure:
    "Camera and microphone need a secure connection (HTTPS). This page is served over plain HTTP.",
  unsupported: "This browser does not support camera and microphone access.",
  unknown: "Could not access your camera and microphone.",
};

function classify(error: unknown): MediaAccessError {
  if (error instanceof MediaAccessError) return error;

  const name = error instanceof DOMException ? error.name : "";

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return new MediaAccessError("denied", MESSAGES.denied);
    case "NotFoundError":
    case "OverconstrainedError":
      return new MediaAccessError("not-found", MESSAGES["not-found"]);
    case "NotReadableError":
    case "AbortError":
      return new MediaAccessError("in-use", MESSAGES["in-use"]);
    default:
      return new MediaAccessError("unknown", MESSAGES.unknown);
  }
}

export function requestMedia(opts: {
  video: boolean;
  audio: boolean;
}): Promise<MediaStream> {
  // `mediaDevices` is absent entirely on plain HTTP in production. Separating
  // that from "old browser" matters: the fix is a certificate, not a browser.
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    const insecure =
      typeof window !== "undefined" && window.isSecureContext === false;
    const kind: MediaErrorKind = insecure ? "insecure" : "unsupported";
    return Promise.reject(new MediaAccessError(kind, MESSAGES[kind]));
  }

  return navigator.mediaDevices
    .getUserMedia({ video: opts.video, audio: opts.audio })
    .catch((error: unknown) => {
      throw classify(error);
    });
}

/**
 * Stop every track. Must run on every teardown path — a camera light still on
 * after leaving the meeting is the classic bug here.
 */
export function stopStream(stream: MediaStream | null): void {
  if (!stream) return;
  for (const track of stream.getTracks()) track.stop();
}

export type DeviceList = {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  /** Audio *output* devices — needed for the "default speaker" notice. */
  speakers: MediaDeviceInfo[];
};

/**
 * Available devices. Labels stay empty until permission is granted, so call
 * this only after a successful `requestMedia`.
 */
export async function listDevices(): Promise<DeviceList> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return { cameras: [], microphones: [], speakers: [] };
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  return {
    cameras: devices.filter((device) => device.kind === "videoinput"),
    microphones: devices.filter((device) => device.kind === "audioinput"),
    speakers: devices.filter((device) => device.kind === "audiooutput"),
  };
}
