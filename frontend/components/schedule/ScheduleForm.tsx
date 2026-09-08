"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { InviteDialog } from "@/components/meeting/InviteDialog";
import { DateField } from "@/components/schedule/DateField";
import { DurationField } from "@/components/schedule/DurationField";
import { TimeField } from "@/components/schedule/TimeField";
import { TimezoneField } from "@/components/schedule/TimezoneField";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { useCreateMeeting } from "@/hooks/useCreateMeeting";
import {
  type Meridiem,
  getBrowserTimeZone,
  nextHalfHourInZone,
  todayInZone,
  zonedWallClockToUtcIso,
} from "@/lib/datetime";
import type { Meeting } from "@/lib/types";

const MAX_TOPIC_LENGTH = 255;

type Errors = Partial<Record<"topic" | "when" | "duration", string>>;

export function ScheduleForm() {
  const router = useRouter();
  const { create, creating, error: apiError } = useCreateMeeting();

  // Defaults are computed once, in the browser's own zone.
  const [timeZone, setTimeZone] = useState(getBrowserTimeZone);
  const [topic, setTopic] = useState("My Meeting");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [date, setDate] = useState(() => todayInZone(getBrowserTimeZone()));
  const [{ time, meridiem }, setClock] = useState(() =>
    nextHalfHourInZone(getBrowserTimeZone()),
  );
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(40);
  const [errors, setErrors] = useState<Errors>({});
  const [created, setCreated] = useState<Meeting | null>(null);

  // Pre-select the default topic so typing replaces it, as in the reference.
  // A ref + select() rather than autoFocus, which hijacks keyboard focus.
  const topicRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    topicRef.current?.select();
  }, []);

  function clear(field: keyof Errors) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTopic = topic.trim();
    const durationMin = hours * 60 + minutes;
    const scheduledStart = zonedWallClockToUtcIso(date, time, meridiem, timeZone);

    const nextErrors: Errors = {};
    if (trimmedTopic.length === 0) nextErrors.topic = "Topic is required.";
    if (durationMin < 1) nextErrors.duration = "Duration must be at least 1 minute.";
    if (new Date(scheduledStart).getTime() <= Date.now()) {
      nextErrors.when = "Pick a start time in the future.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const meeting = await create({
      topic: trimmedTopic,
      description: description.trim() ? description.trim() : null,
      scheduled_start: scheduledStart,
      duration_min: durationMin,
      timezone: timeZone,
    });

    // Surfacing the auto-generated link is the point of this step.
    if (meeting) setCreated(meeting);
  }

  return (
    <div className="px-8 py-6">
      <Link
        href="/meetings"
        className="inline-flex items-center gap-1.5 text-[13px] text-zoom-blue underline-offset-2 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Meetings
      </Link>

      <h1 className="mt-4 text-[28px] font-semibold leading-tight text-zoom-text">
        Schedule Meeting
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-[1000px]" noValidate>
        <Row label="Topic" required htmlFor="topic">
          <input
            ref={topicRef}
            id="topic"
            type="text"
            value={topic}
            maxLength={MAX_TOPIC_LENGTH}
            onChange={(event) => {
              clear("topic");
              setTopic(event.target.value);
            }}
            aria-invalid={errors.topic ? "true" : undefined}
            className={`w-full max-w-[520px] rounded-lg border bg-white px-3 py-2 text-sm text-zoom-text focus:outline-none focus:ring-2 focus:ring-zoom-blue ${
              errors.topic ? "border-[#E02D3C]" : "border-zoom-border"
            }`}
          />
          <FieldError message={errors.topic} />
        </Row>

        <Row label="">
          {showDescription ? (
            <textarea
              value={description}
              rows={3}
              placeholder="Add a description"
              onChange={(event) => setDescription(event.target.value)}
              aria-label="Meeting description"
              className="w-full max-w-[520px] rounded-lg border border-zoom-border bg-white px-3 py-2 text-sm text-zoom-text focus:outline-none focus:ring-2 focus:ring-zoom-blue"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="text-[13px] text-zoom-blue underline-offset-2 hover:underline"
            >
              + Add Description
            </button>
          )}
        </Row>

        <Row label="When">
          <div className="flex flex-wrap items-center gap-2">
            <DateField
              value={date}
              min={todayInZone(timeZone)}
              invalid={Boolean(errors.when)}
              onChange={(next) => {
                clear("when");
                setDate(next);
              }}
            />
            <TimeField
              time={time}
              meridiem={meridiem}
              onTimeChange={(next) => {
                clear("when");
                setClock((current) => ({ ...current, time: next }));
              }}
              onMeridiemChange={(next: Meridiem) => {
                clear("when");
                setClock((current) => ({ ...current, meridiem: next }));
              }}
            />
          </div>
          <FieldError message={errors.when} />
        </Row>

        <Row label="Duration">
          <DurationField
            hours={hours}
            minutes={minutes}
            onHoursChange={(next) => {
              clear("duration");
              setHours(next);
            }}
            onMinutesChange={(next) => {
              clear("duration");
              setMinutes(next);
            }}
          />
          <FieldError message={errors.duration} />

          <Banner
            variant="warning"
            className="mt-3 max-w-[560px]"
            message="You can schedule meetings for up to 40 minutes each with your current Basic plan. Need more time?"
            action={{ label: "Upgrade to Zoom Workplace Pro", href: "#" }}
          />
        </Row>

        <Row label="Time Zone">
          <TimezoneField
            value={timeZone}
            onChange={(next) => {
              clear("when");
              setTimeZone(next);
            }}
          />
        </Row>

        <Row label="">
          <label
            className="inline-flex cursor-not-allowed items-center gap-2 text-sm text-zoom-text-muted"
            title="Not available on the Basic plan"
          >
            <input
              type="checkbox"
              disabled
              title="Not available on the Basic plan"
              className="h-4 w-4 rounded border-zoom-border"
            />
            Recurring meeting
          </label>
        </Row>

        {apiError ? (
          <div className="mt-6 max-w-[560px] rounded-lg border border-[#F3C0C5] bg-[#FDF2F3] px-4 py-3">
            <p role="alert" className="text-[13px] text-[#B0212E]">
              {apiError.detail}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex items-center gap-3 border-t border-zoom-border pt-6">
          <Button type="submit" variant="primary" size="md" disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => router.push("/meetings")}
          >
            Cancel
          </Button>
        </div>
      </form>

      {created ? (
        <InviteDialog
          meeting={created}
          open
          onClose={() => router.push("/meetings")}
          primaryAction={{ label: "Done", onClick: () => router.push("/meetings") }}
        />
      ) : null}
    </div>
  );
}

/** Label column on the left, controls to its right. */
function Row({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] sm:gap-4">
      <label
        htmlFor={htmlFor}
        className="pt-2 text-sm text-zoom-text sm:text-right"
      >
        {required ? <span className="mr-0.5 text-[#E02D3C]">*</span> : null}
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-[13px] text-[#E02D3C]">
      {message}
    </p>
  );
}
