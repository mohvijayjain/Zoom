"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError, getMeeting } from "@/lib/api";
import {
  formatMeetingIdInput,
  isValidMeetingId,
  looksNumeric,
  normalizeMeetingId,
} from "@/lib/meetingId";
import { cn } from "@/lib/utils";

export function JoinForm() {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();

  // Display string and submit value are tracked separately: the input shows
  // "541 6806 1911" while the request uses "54168061911".
  const [display, setDisplay] = useState("");
  const [digits, setDigits] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = isValidMeetingId(display);

  function handleChange(next: string) {
    // Any edit clears a previous failure.
    setError(null);
    setDigits(normalizeMeetingId(next));

    // Regroup while the value is still numeric. A personal link name passes
    // through verbatim so the formatter never eats someone's letters.
    // Reformatting on each keystroke sends the caret to the end when editing
    // mid-string — the real product behaves the same way.
    setDisplay(
      looksNumeric(next) || isValidMeetingId(next)
        ? formatMeetingIdInput(normalizeMeetingId(next))
        : next,
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || checking) return;

    setChecking(true);
    setError(null);

    // A one-shot imperative check — `useMeeting` fetches on mount, which is
    // the wrong shape for a form submit.
    try {
      const meeting = await getMeeting(digits);

      if (meeting.status === "ended") {
        setError("This meeting has ended.");
        setChecking(false);
        return;
      }

      router.push(`/meeting/${digits}`);
      // `checking` stays true through navigation so the button cannot re-fire.
    } catch (err) {
      setError(messageFor(err));
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[460px] px-6 pb-16 pt-20">
      <h1 className="text-center text-[32px] font-semibold leading-tight text-zoom-text">
        Join Meeting
      </h1>

      <form onSubmit={handleSubmit} className="mt-8" noValidate>
        <label htmlFor={inputId} className="block text-sm text-zoom-text">
          Meeting ID or Personal Link Name
        </label>

        <input
          id={inputId}
          type="text"
          value={display}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Enter Meeting ID or Personal Link Name"
          // Numeric keypad on mobile, but letters stay typable for link names.
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "mt-2 w-full rounded-lg border px-3 py-2.5 text-sm text-zoom-text",
            "placeholder:text-zoom-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-zoom-blue",
            error ? "border-[#E02D3C]" : "border-zoom-border",
          )}
        />

        {error ? (
          <p id={errorId} role="alert" className="mt-2 text-[13px] text-[#E02D3C]">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canSubmit || checking}
          className="mt-4 h-11 w-full"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
        </Button>
      </form>

      <p className="mt-10 text-center">
        <Link
          href="#"
          className="text-[13px] text-zoom-blue underline-offset-2 hover:underline"
        >
          Join a meeting from an H.323/SIP room system
        </Link>
      </p>
    </div>
  );
}

function messageFor(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (err.status === 404) return "Invalid meeting ID. Please check and try again.";
  if (err.status === 0) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  return err.detail;
}
