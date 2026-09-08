"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MediaAccessError, requestMedia, stopStream } from "@/lib/media";

export type MediaStreamController = {
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  error: MediaAccessError | null;
  requesting: boolean;
  start: (opts: { video: boolean; audio: boolean }) => Promise<MediaStream | null>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  stop: () => void;
};

/**
 * Owns the single MediaStream for a meeting session.
 *
 * Instantiate this at the level that owns *both* the pre-join screen and the
 * room, so the stream survives the handoff instead of being re-requested.
 */
export function useMediaStream(): MediaStreamController {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [error, setError] = useState<MediaAccessError | null>(null);
  const [requesting, setRequesting] = useState(false);

  // The ref mirrors the stream so cleanup and the toggles can reach it without
  // becoming effect/callback dependencies — that would re-run teardown on
  // every render and tear down a live camera mid-session.
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setVideoEnabled(false);
    setAudioEnabled(false);
  }, []);

  const start = useCallback(
    async (opts: { video: boolean; audio: boolean }) => {
      setRequesting(true);
      setError(null);

      try {
        // Replace any previous stream rather than leaking it.
        stopStream(streamRef.current);

        const next = await requestMedia(opts);

        streamRef.current = next;
        setStream(next);
        setVideoEnabled(opts.video && next.getVideoTracks().length > 0);
        setAudioEnabled(opts.audio && next.getAudioTracks().length > 0);

        return next;
      } catch (err) {
        streamRef.current = null;
        setStream(null);
        setVideoEnabled(false);
        setAudioEnabled(false);
        setError(
          err instanceof MediaAccessError
            ? err
            : new MediaAccessError("unknown", "Could not access your devices."),
        );
        return null;
      } finally {
        setRequesting(false);
      }
    },
    [],
  );

  /**
   * Toggles flip `track.enabled` on the existing tracks. Re-requesting the
   * stream would blink the camera light and cost ~500ms.
   */
  const toggleVideo = useCallback(() => {
    setVideoEnabled((previous) => {
      const next = !previous;
      for (const track of streamRef.current?.getVideoTracks() ?? []) {
        track.enabled = next;
      }
      return next;
    });
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((previous) => {
      const next = !previous;
      for (const track of streamRef.current?.getAudioTracks() ?? []) {
        track.enabled = next;
      }
      return next;
    });
  }, []);

  // Empty deps: this must run exactly once on unmount, never on re-render.
  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  return {
    stream,
    videoEnabled,
    audioEnabled,
    error,
    requesting,
    start,
    toggleVideo,
    toggleAudio,
    stop,
  };
}
