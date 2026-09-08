"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { SidePanel } from "@/components/meeting/SidePanel";

type ChatMessage = {
  id: number;
  sender: string;
  body: string;
  /** Pre-formatted; these are seeded, not real timestamps. */
  time: string;
};

const SEEDED: ChatMessage[] = [
  {
    id: 1,
    sender: "Mohvijay Jain",
    body: "Thanks for joining — starting with the sprint board in a minute.",
    time: "10:01 AM",
  },
  { id: 2, sender: "Aarav Shah", body: "Can you share your screen?", time: "10:02 AM" },
  {
    id: 3,
    sender: "Mohvijay Jain",
    body: "Sure, one second.",
    time: "10:02 AM",
  },
  { id: 4, sender: "Priya Nair", body: "Audio is clear on my end 👍", time: "10:03 AM" },
];

export type ChatPanelProps = {
  onClose: () => void;
  /** Attributed to outgoing messages. */
  displayName: string;
};

/**
 * UI-only chat. Messages live in local state — nothing is transmitted and
 * nothing persists, which the panel says out loud rather than implying
 * otherwise with a convincing-looking send button.
 */
export function ChatPanel({ onClose, displayName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(SEEDED);
  const [draft, setDraft] = useState("");

  function send() {
    const body = draft.trim();
    if (!body) return;

    setMessages((current) => [
      ...current,
      {
        id: (current.at(-1)?.id ?? 0) + 1,
        sender: displayName,
        body,
        time: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      },
    ]);
    setDraft("");
  }

  return (
    <SidePanel
      title="Chat"
      onClose={onClose}
      footer={
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type message here..."
            aria-label="Chat message"
            className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-zoom-blue"
          />
          <button
            type="submit"
            disabled={draft.trim().length === 0}
            aria-label="Send message"
            className="shrink-0 rounded-lg bg-zoom-blue p-2 text-white transition-colors hover:bg-zoom-blue-hover disabled:bg-white/10 disabled:text-white/30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      }
    >
      <p className="border-b border-white/10 px-4 py-2 text-[11px] text-white/40">
        Messages are visible only in this session.
      </p>

      <div className="flex flex-col gap-3 p-4">
        {messages.map((message) => (
          <div key={message.id}>
            <p className="text-[11px] text-white/45">
              {message.sender} · {message.time}
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-white">
              {message.body}
            </p>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}
