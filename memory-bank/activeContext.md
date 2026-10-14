# Active Context — PrepPilot

> Single source of truth for current project status, recent changes, and upcoming tasks.

## Current State
- **Branch**: `dev`
- **Database**: Live Supabase PostgreSQL pool (`postgresql+asyncpg://`)
- **Backend**: FastAPI on port 8000 with JWT auth, password hashing, and Alembic migrations
- **Frontend**: Next.js 16.3 (App Router) on port 3000 with Obsidian Gloss theme
- **AI Infrastructure**: Multi-tier engine (OpenRouter primary -> Google Gemini fallback -> Groq fallback -> Structured fallback)

## What Was Fixed & Integrated
1. **Branch Consolidation & Database Wiring**:
   - Merged PRs into `dev`, resolved schema and model conflicts.
   - Connected live Supabase database with async SQLAlchemy engine and Alembic migrations.
   - Removed in-memory dictionary stores across `feedback_service.py` and `video/service.py` to persist data in PostgreSQL.
   - Populated database via `backend/scripts/seed_db.py` with expert profiles, availability slots, and feedback records.
2. **Authentication & Password Security**:
   - Upgraded auth from mock session tokens to secure JWT authentication using `passlib[bcrypt]`.
   - Resolved `bcrypt` v5.0 incompatibility by locking `bcrypt<4.0.0` (3.2.2).
   - Added candidate/expert role selection cards on `/login` and `/signup`.
   - Fixed missing `frontend/lib/utils.ts` and `cn` helper that caused client runtime crashes.
3. **Backend Modular Architecture & Circular Import Fixes**:
   - Resolved circular dependency in `app.models` by consolidating ATS models (`ResumeReport`, `CandidateApplicant`) into `app/models/resume.py`.
   - Dynamic user resolution in `backend/app/api/bookings.py` using `get_optional_current_user` so bookings belong to real authenticated users.
   - Normalized feedback scoring in `backend/app/api/feedback.py` to handle both 1-5 and 0-100 scales gracefully.
4. **AI Engine Overhaul**:
   - Integrated OpenRouter with `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` (`meta-llama/llama-3.3-70b-instruct:free`).
   - Integrated Google Gemini API key.
   - Built live `/api/ai/interview/chat` endpoint and wired it to `/mock-interview` so candidate answers receive real-time technical follow-up questions from AURA.
5. **Frontend Navigation & Complete Route Matrix (Zero 404s)**:
   - Fixed landing page header: added Login and Sign Up Free buttons.
   - Fixed primary hero CTA from dead `/jd-analyzer` to `/signup`.
   - Integrated shared Navbar links for Book Mentor, AI Mock, and Feedback.
   - Built and routed all missing microservice pages: `/jd-analyzer`, `/report`, `/jobs`, `/teams`.
   - Wired `/mentors` booking modal to call `POST /api/bookings` and route to live `/video` session.
   - Tested full production build (`npm run build`): all 18 routes compile with 0 errors.

## Next Tasks & Team Delegation
1. Add production OpenRouter API key to `backend/.env`.
2. Set `SUPABASE_JWT_SECRET` in `backend/.env` so Supabase-issued JWTs verify on the backend (dev-issued JWTs work without it).
3. Team assignments:
   - **Teammate 1 (Interviews & Questions)**: Persist AI sessions — add `ai_interview_sessions`/`ai_interview_turns` tables + `POST /api/ai/sessions`, `/chat` (persist turns), `/{id}/finish` (LLM rubric → write `feedback` row); wire `/mock-interview` Finish button to it instead of the hardcoded 91/100 modal.
   - **Teammate 2 (Video & Whiteboard)**: Test and polish multi-user Jitsi room controls.
   - **Teammate 3 (Candidate Dashboard)**: Build candidate bookings history tab in `/profile` (`GET /api/bookings` + past feedback links).
   - **Teammate 4 (Expert Management)**: Enhance `/expert` dashboard with slot availability calendar (`POST /api/experts/{id}/slots` + upcoming bookings list).

## Session 2026-10-13 (pt.2) — working AI mock interview loop
1. **Backend session engine** (`app/models/ai_interview.py`, `app/services/ai_interview_service.py`, `app/api/ai_sessions.py` mounted at `/api/ai`):
   - `POST /sessions` — model writes N tailored questions for the chosen position (JD-aware), stored in `ai_interview_sessions`.
   - `POST /sessions/{id}/turns` (multipart audio +/or transcript) — Groq Whisper STT → single-LLM live analysis (depth/clarity/STAR + note) → stored in `ai_interview_turns`.
   - `POST /sessions/{id}/finish` (optional session video) — best-effort upload to Supabase Storage bucket `interview-recordings`, single-LLM final rubric → writes `feedback` row (`authored_by="ai"`) so `/feedback?sessionId=` renders it. Owner-checked via `get_current_user`.
   - Alembic migration `20261013_ai_sessions` (downstream of `ad50d617221e`) — SQL verified offline; **NOT yet applied to live Supabase** (this machine has no IPv6 route to the pooler host). Run `alembic upgrade head` from a connected network + create the storage bucket (see task 4).
2. **Frontend live loop** (`/mock-interview`): mandatory camera pre-flight gate (stream reused for session); Start creates the backend session; questions spoken via browser TTS; whole-session `MediaRecorder` video + per-answer audio recorder; typed fallback posts transcript; live telemetry shows running averages; Finish uploads video + generates report → auto-routes to `/feedback?sessionId=`. `/feedback` accepts `?sessionId=` deep links.
3. **Gemini model fix**: `gemini-1.5-flash` is 404 for this key — probed `list_models`, now using `gemini-3.8-flash` (verified live: tailored questions + real scoring + real report). Smoke-tested end-to-end minus DB.
4. **Still needed for voice demo**: `GROQ_API_KEY` in `backend/.env` (free: console.groq.com) — without it, audio answers fail STT and only typed answers work. Also create Storage bucket `interview-recordings` with an authenticated-upload policy, e.g.: `insert into storage.buckets (id, name, public) values ('interview-recordings','interview-recordings', false)` + an INSERT policy for `authenticated` on `storage.objects` where `bucket_id = 'interview-recordings'`.

## Session 2026-10-13 (pt.3) — local STT + local-only video (no cloud dependency for media)
1. **Transcription is now local**: `faster-whisper==1.2.1` installed in `backend/venv`, `WHISPER_MODEL=tiny` default (override in `.env`, documented in `.env.example`). `transcribe_audio()` tries local Whisper first (lazy-loaded, CPU/int8, off the event loop via `asyncio.to_thread`), Groq hosted Whisper only as fallback, clear "type it instead" error otherwise. Verified live: model loads, transcribes, detects `en`.
2. **Video is local-only**: removed the Supabase Storage upload path (`upload_video` deleted, `finish` takes no video payload). The session recording shows in the preview + REC badge, stays on the candidate's device, and the finish modal offers **Download my recording**. Storage bucket no longer required — transcripts + analyses + report are the only things persisted (Postgres).
3. **OpenRouter 404 fixed**: the pinned `meta-llama/llama-3.3-70b-instruct:free` slug is retired. Default (and the user's `backend/.env`) now `openrouter/free` auto-router, which always resolves to a live free model. Chain is OpenRouter → Gemini (`gemini-3.8-flash`) → Groq → static fallbacks.
4. **Verified**: `tsc` clean, `npm run build` exit 0, backend compiles. Health check is `GET /api/health` (there is no `/health`).
5. **To run**: restart uvicorn (picks up new code + both new keys + local Whisper). First transcription downloads the ~150MB tiny model once (already pre-downloaded on this machine).

## Session 2026-10-13 (pt.4) — demo polish: hearable, visible, transcribable
1. **Dialogue title removed** (`/mock-interview`): the "Real-Time Dialogue Stream / Continuous Speech Ingestion" header row is gone; messages stand alone.
2. **Hearable**: per-question **Replay button** on every AI message (click = fresh user gesture, sound always recoverable on stage); `voiceschanged` warmup so first question has a voice; stuck-state safety timeout; setup gains a **"Test AURA's voice"** button to prove room audio before starting. Orb status line now shows `AURA IS SPEAKING — LISTEN IN…` vs `CHALLENGE STATE: QUESTION x OF y`.
3. **Visible capture**: fake level bars replaced with a **real AnalyserNode canvas meter** (no re-renders, direct canvas draw) + `REC mm:ss` timer in the capture header; answers shorter than ~1.5s are rejected with "too short" instead of sent to STT.
4. **Transcribable**: STT retry chain VAD → raw → Groq with fast `beam_size=1`; fixed a real env bug found while verifying — `av` 19.x is incompatible with faster-whisper 1.2.1 (`metadata_errors` kwarg), pinned `av>=11,<14` (now 13.1.0) in requirements; verified local passes run clean and Groq fallback engages. Chain proven on tone input (correct empties → Groq `.`).
5. **`/health` 404 noise is external**: no poller in the repo (grepped frontend+backend) — it's the user's own health-check tab/curl hitting the wrong path; correct is `GET /api/health`.
6. **Verified**: `tsc` clean, `npm run build` exit 0, backend compiles.
7. **MediaRecorder hardening (NotSupportedError fix)**: `isTypeSupported()` lies on some Chrome/Edge builds — `start()` threw on the audio mime. Answer recorder now tries `audio/webm;codecs=opus` → `audio/webm` → `audio/mp4` → browser default, and falls back to a typed-answer message instead of crashing. Session recorder got the same chain and can no longer block Start; interview proceeds even if local recording is unavailable.
8. **Stage layout (committed `e00a417`)**: neural orb replaced with an animated SVG cartoon avatar (mouth bars dance while speaking, smile when idle); side-by-side AURA tile + user camera tile; Answer/Send controls moved above the transcript; all prior work saved to `dev` as `cffc591` first (`.env` excluded).
9. **Supavisor prepared-statement fix**: transaction-mode pooler broke asyncpg (`DuplicatePreparedStatementError`) for both app and migrations — set `statement_cache_size=0` in `app/core/database.py` and `alembic/env.py`. Verified: `alembic current` → `20261013_ai_sessions (head)` through the pooler.
10. **Header-overlap fix**: `/report`, `/jobs`, `/jd-analyzer`, `/teams` had no top offset for the fixed `AppHeader` (content hid underneath); standardized to `pt-32`, `/mentors` bumped `pt-28` → `pt-32`. Build exit 0.
11. **Pool poisoning fix (`PendingRollbackError`)**: routers swallow errors into `{data, error}` envelopes so `get_db` never rolled back — poisoned connections were returned to the pool and killed later requests. `get_db` now always rolls back in `finally`; engine uses `NullPool` (Supavisor pools server-side). Verified live: sessions table readable through pooler (6 rows — earlier session creates had persisted).

## Session 2026-10-13 — UI unification + real auth (branch `dev`, single worker + 2 subagents)
1. **Shared Obsidian shell**: new `frontend/components/layout/AppHeader.tsx` (fixed header + microservices strip + auth-aware CTAs), `AppFooter.tsx`, `PageShell.tsx` (`PageShell` + `ObsidianCard`). `app/layout.tsx` now renders them globally; deleted shadcn `components/Navbar.tsx`.
2. **Deduped per-page headers/footers** from `/`, `/mentors`, `/mock-interview`, `/resume` (were copy-pasted ~100-200 lines each, caused double nav).
3. **Migrated legacy shadcn pages to Obsidian**: `/login`, `/signup`, `/feedback`, `/booking`, `/profile`, `/expert`, `/admin`, `/video` (no more `bg-card`/`bg-muted`/lucide/inline navs on these routes).
4. **AI interview setup gate** (`/mock-interview`): setup phase explains the interview, collects target role/level/domain/duration/question-count/optional JD + mode, enforces mic pre-flight check (or text-only), then launches live session with dynamic header and passes `target_role` + `job_description` to existing `POST /api/ai/interview/chat` (`backend/app/api/ai.py` + `services/ai_service.py` — confirmed this is the only AI backend, still stateless, no session tables yet).
5. **Demo auth removed everywhere**: frontend `auth-context` no longer auto-logs `mock-candidate-001`, `loginAsDemo`/`switchRole` deleted; `ProtectedRoute` redirects to `/login` (no role-switch buttons); `/video` uses real `user.id`/email + Bearer token; backend deleted `POST /api/auth/demo-login`, `DEMO_USERS`, and demo-token fast-paths in `security.py` (dev JWT fallback kept for `/api/auth/*`-issued tokens).
6. **Verified**: `npx tsc --noEmit` clean, `npm run build` exit 0 — all 18 routes static. No `.env` changes (no new vars).
