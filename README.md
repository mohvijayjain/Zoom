# Zoom Clone

A functional clone of the Zoom web app: schedule and host meetings, share an
invite link, join from a browser with real camera and microphone access, and
manage participants from inside the meeting room.

**Stack:** FastAPI + SQLAlchemy 2.0 + SQLite · Next.js 14 (App Router) +
TypeScript + Tailwind CSS

---

## Running it

Two servers, two terminals. Backend first — the frontend expects it on port 8000.

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload --port 8000

# macOS / Linux
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Tables are created and seeded on first start. Interactive API docs:
<http://127.0.0.1:8000/docs>

The backend targets **Python 3.12**. `backend/.python-version` pins `3.12.5`,
which `pyenv` picks up automatically on clone and which hosting platforms read
to select a runtime. `backend/runtime.txt` carries the same pin in the
`python-3.12.5` format that some build images look for instead. The pinned
`pydantic` pulls in `pydantic-core==2.27.2`, which ships wheels up to CPython
3.13; on anything newer pip falls back to compiling it from Rust source, which
fails on read-only build filesystems. The app itself needs 3.10+, so the usable
range is 3.10–3.13.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

**Requirements:** Python 3.12 (3.10–3.13 all work; 3.12.5 is what the deploy
pins), Node 18+.

### Environment

Both packages ship a `.example` template. Defaults work for local development.

| File | Variable | Default |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | `sqlite:///./zoom.db` |
| `backend/.env` | `FRONTEND_URL` | `http://localhost:3000` (added to CORS) |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` |
| `frontend/.env.local` | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (invite links) |

---

## Deployment

### Backend (Render)

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Environment variables:

- **`PYTHON_VERSION=3.12.5`** — set this. Render's default runtime is newer
  than some pinned wheels support: on Python 3.14 there is no prebuilt
  `pydantic-core` wheel, so pip falls back to a Rust source build that fails on
  the read-only build filesystem. `.python-version` and `runtime.txt` both
  carry the same pin, but which of the three a given build image honours
  varies, so setting all three removes the ambiguity.
- `FRONTEND_URL` — the deployed frontend origin, added to the CORS allow-list.
- `DATABASE_URL` — optional. Defaults to SQLite, which on Render's ephemeral
  disk resets on redeploy; point it at a managed Postgres instance to persist.

### Frontend (Vercel)

Root directory `frontend`. Set `NEXT_PUBLIC_API_URL` to the deployed backend's
`/api` URL and `NEXT_PUBLIC_APP_URL` to the frontend's own origin so invite
links resolve.

Serve over HTTPS. `getUserMedia` is blocked on plain HTTP outside `localhost`,
and the pre-join screen surfaces that as its own "needs HTTPS" message.

---

## Seeded data

No auth — one seeded user stands in for the logged-in account. Seeding is
idempotent and skipped if any user already exists; delete `backend/zoom.db` to
start over.

- **User:** Mohvijay Jain · Personal Meeting ID `541 6806 1911` · Workplace Basic
- **2 upcoming meetings** — Sprint 24 Planning, Design Review
- **3 ended meetings** — for the Recent activity and Previous lists

---

## What to try

| Page | Route |
| --- | --- |
| Dashboard | `/` |
| Join a meeting | `/join` |
| Meetings list (Upcoming / Previous) | `/meetings` |
| Schedule a meeting | `/meetings/schedule` |
| Invite landing page | `/j/{meetingId}` |
| Pre-join + meeting room | `/meeting/{meetingId}` |

**Host an instant meeting.** The orange **Host** tile on the dashboard creates a
meeting and opens the invite dialog, so the generated link is visible before you
enter the room. **Start meeting** takes you to the pre-join screen.

**Schedule one.** `/meetings/schedule` collects a wall-clock time and a
timezone. Save, and the invite dialog shows the auto-generated link; **Done**
lands on `/meetings` with the meeting under Upcoming.

**Join by ID.** `/join` accepts `839 2017 4562`, bare digits, or a pasted
`/j/{id}` URL. The button stays disabled until the ID is valid.

**The meeting room, with two people.** Open **two separate browser windows** at
`/meeting/83920174562`. Join as `Mohvijay Jain` in one to get host privileges,
and any other name in the second. Each sees the other within ~5 seconds. The
host can then mute or remove the other participant from the Participants panel,
or end the meeting for everyone.

> Use two **windows**, not two tabs. A background tab reports
> `visibilityState: "hidden"` and skips its poll by design, so it will look
> frozen until you focus it.

---

## API

All endpoints are under `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/me` | The seeded default user |
| `GET` | `/health` | Liveness check |
| `POST` | `/meetings/instant` | Start a live meeting now. `?use_personal_room=true` reuses the PMI |
| `POST` | `/meetings` | Create a scheduled meeting |
| `GET` | `/meetings?filter=upcoming\|recent` | Upcoming (ascending) or last 10 ended (descending) |
| `GET` | `/meetings/{meeting_id}` | Look up by the 11-digit ID; embeds the host |
| `POST` | `/meetings/{meeting_id}/join` | Add a participant; flips `scheduled` → `live` |
| `POST` | `/meetings/{meeting_id}/end` | End for everyone; stamps `left_at` on all actives |
| `GET` | `/meetings/{meeting_id}/participants` | Active participants (`left_at IS NULL`) |
| `PATCH` | `/participants/{id}` | Toggle `is_muted` / `video_on` |
| `DELETE` | `/participants/{id}` | Leave or remove — soft delete, stamps `left_at` |

`{meeting_id}` is the shareable 11-digit ID, not the surrogate primary key.

---

## Structure

```
backend/
  app/
    main.py          FastAPI app, CORS, lifespan (create tables + seed)
    database.py      engine, SessionLocal, Base, get_db dependency
    models.py        User, Meeting, Participant
    schemas.py       Pydantic request/response models
    utils.py         meeting-ID generation and formatting
    seed.py          idempotent seed data
    routers/         meetings.py, participants.py

frontend/
  app/
    (dashboard)/     route group — navbar + sidebar chrome
      page.tsx         dashboard
      join/            /join
      meetings/        list + schedule/
    j/[meetingId]/   invite landing — its own slim layout
    meeting/[meetingId]/  pre-join + room — dark, no chrome
  components/
    ui/              Button, Card, Avatar, Dialog, Select, Skeleton, …
    layout/          Navbar, Sidebar
    dashboard/       ProfileCard, QuickActions, UpcomingMeetings, …
    meeting/         PreJoinScreen, MeetingRoom, ControlBar, panels, …
    meetings/        MeetingListItem
    schedule/        ScheduleForm and its field components
  hooks/             useApiResource, useMeetings, useMediaStream, useParticipants, …
  lib/               api, types, format, datetime, media, controls, …
```

---

## Design notes

**Three layers on the frontend.** `lib/api.ts` owns transport and the single
`ApiError` shape; hooks own state; components own presentation. No component or
hook calls `fetch` directly.

**Two sibling layouts, one route tree.** `(dashboard)` is a route group, so the
parentheses keep it out of the URL while giving every page inside it the same
chrome. The invite page and the meeting room live *outside* the group — the
sidebar isn't conditionally hidden there, it doesn't exist on that branch.

**The API contract is decoupled from storage.** Routers reach the database only
through a session from `Depends(get_db)`, and `schemas.py` has zero SQLAlchemy
imports — meeting status is a `Literal`, not the ORM enum.

**Timestamps are naive UTC end to end.** The backend stores and returns
`"2027-01-15T05:00:00"` with no `Z`. `new Date()` would read that as local time
and silently shift every timestamp, so every parse goes through `parseUtc` in
`lib/format.ts`. Going the other way, `lib/datetime.ts` converts a wall clock in
a given timezone to the right UTC instant using a two-pass `Intl` correction — a
single pass measures the offset at the wrong instant and is an hour off near a
DST boundary. No date library.

**Removal is a soft delete.** `DELETE /participants/{id}` stamps `left_at` and
keeps the row. That's why `GET /participants` filters on `left_at IS NULL`
rather than the table shrinking, and it's what keeps "who attended this
meeting" answerable afterwards.

**Polling, not WebSockets.** The participant roster refreshes every 5 seconds —
about 12 requests/minute against SQLite, which is nothing at this scale, and it
cost a few lines instead of a socket layer. The poll skips hidden tabs and
refetches immediately on `visibilitychange`. Exactly one `useParticipants`
instance exists per room; the video grid and the participants panel share it.

**One media stream per session.** `useMediaStream` is instantiated in
`app/meeting/[meetingId]/page.tsx`, which owns both the pre-join screen and the
room, so the stream survives the handoff instead of re-prompting. Mute and
camera toggles flip `track.enabled` on the existing tracks rather than
re-requesting, and every exit path calls `stopStream` so the camera light
actually goes out.

**Data-driven chrome.** The navbar, sidebar and meeting control bar all render
from arrays (`lib/constants.ts`, `lib/controls.ts`), so adding or removing an
item is a data change rather than a JSX change.

---

## Assumptions

- The Join input accepts personal link names as text, but the backend keys meetings on numeric IDs only — there is no `personal_link_name` column — so a pure link name will not resolve and the Join button stays disabled for it. Numeric IDs, spaced IDs, and pasted `/j/{id}` invite URLs all work.
- **No authentication.** A single seeded user is treated as the signed-in
  account everywhere. `GET /me` returns it, and it is assumed to be the host of
  meetings it created.
- **Host identity is inferred by name.** A participant joining their own
  meeting with the seeded user's display name is treated as the host. There are
  no accounts to authenticate against.
- **Duration allows 40 minutes.** The schedule form offers `0/15/30/40/45` for
  minutes rather than Zoom's `0/15/30/45`, because the Basic-plan cap referenced
  in the form's own warning banner — and the backend's default — is 40.
- **Legacy timezone identifiers are normalised.** Browsers may report
  `Asia/Calcutta` rather than `Asia/Kolkata`; both convert identically, but the
  alias is mapped to its canonical name so it matches the timezone list.

## Limitations

Deliberately out of scope for this assignment, and visible in the UI rather
than faked:

- **No peer-to-peer video.** `getUserMedia` gives each participant a real local
  camera preview; there is no WebRTC signalling, so participants see their own
  video and an avatar tile for everyone else.
- **Chat is UI-only.** Messages live in local component state and are never
  transmitted. The panel says so at the top rather than implying otherwise.
- **Some controls are placeholders.** React, Share, Host Tools, Zoom AI and More
  open plausible menus that no-op. The device pickers list real devices but
  selecting a different one is inert.
- **Some sidebar links go nowhere.** Recordings, Summaries and the
  external-link items have no pages behind them.
- **`getUserMedia` needs a secure context.** It works on `localhost`, but a
  deployment served over plain HTTP will fail — surfaced as its own
  "needs HTTPS" message rather than a generic error.
- **A background tab's roster goes stale** until you focus it, by design.
