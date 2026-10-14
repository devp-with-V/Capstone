# Progress — PrepPilot

> Living checklist of completed vs open engineering items for PrepPilot.

## What works

### Core Infrastructure & Database
- [x] Connect Postgres database via Alembic migration (`postgresql+asyncpg://` Supabase pool)
- [x] Auto-generate and apply schema migrations for Auth, Booking, Video, Feedback, Resume/ATS
- [x] Database seeding script (`seed_db.py`, `seed_fb.py`) populating live expert profiles, slots, and feedback

### Auth & Security
- [x] Native password hashing using `passlib[bcrypt]` with `bcrypt<4.0.0` locked compatibility
- [x] JWT token generation and verification (`create_access_token`, `verify_token`, `get_current_user`)
- [x] Role-based routing: Candidate vs Expert vs Admin access guards
- [x] Frontend Login and Signup forms with Candidate / Expert role selection
- [x] Shared Navbar with authenticated user badges, role switcher, and logout

### AI & Intelligence Engine
- [x] Multi-tier AI Service: OpenRouter (free models: `llama-3.3-70b:free`, etc.) -> Gemini 1.5 Flash -> Groq -> Fallback
- [x] AI interview follow-up engine: `POST /api/ai/interview/chat`
- [x] Live chat integration in `/mock-interview`: evaluates answers and generates deep-dive follow-up questions
- [x] Resume ATS 4-pillar evaluation and scoring engine (Impact, Technical Depth, ATS Compatibility, Structure)

### Expert Booking & Video
- [x] Dynamic expert discovery via database (`GET /api/experts`)
- [x] Slot creation and retrieval (`GET /api/experts/{id}/slots`)
- [x] Database booking creation (`POST /api/bookings`) with row-level concurrency lock (`with_for_update`)
- [x] Jitsi Meet WebRTC room creation and join interface in `/video`
- [x] Mentor booking modal in `/mentors` wired directly to backend API and database

### Performance & Feedback
- [x] Structured feedback storage and retrieval (`/api/feedback/{session_id}`)
- [x] Normalized feedback calculation supporting 1-5 and 0-100 scales with strengths and improvements
- [x] Seeded demo session `demo-session-002` viewable on `/feedback`

### Pages & Routing (0 Broken Links / 0 404s, unified Obsidian Gloss shell)
- [x] `/` (Landing Page with Login / Signup header and active CTAs)
- [x] `/login` & `/signup` (Obsidian restyle, real Supabase/backend auth, no auto-demo)
- [x] `/resume` & `/resume/report` (shared global header/footer, no per-page duplicate)
- [x] `/mock-interview` (setup gate: role/level/domain/duration/questions/JD + mic pre-flight → live AURA session; route guarded by auth)
- [x] `/mentors` & `/booking` (Obsidian; shared global header/footer)
- [x] `/feedback` (Obsidian restyle, session-ID lookup + report sections)
- [x] `/video` (Obsidian restyle, real user id/email + Bearer token on session APIs)
- [x] `/profile` (Obsidian restyle)
- [x] `/expert` (Obsidian restyle)
- [x] `/admin` (Obsidian restyle)
- [x] `/jd-analyzer`
- [x] `/report`
- [x] `/jobs`
- [x] `/teams`
- [x] Shared `components/layout/` (`AppHeader`, `AppFooter`, `PageShell`/`ObsidianCard`); `components/Navbar.tsx` removed
- [x] Demo auth removed frontend + backend (`demo-login` endpoint, `DEMO_USERS`, demo-token fast-paths deleted)

---

## Remaining Work (Team Delegation Plan)

### Teammate 1: AI Mock Interview — session persistence (DONE 2026-10-13, needs deploy steps)
- [x] `ai_interview_sessions` / `ai_interview_turns` tables + migration `20261013_ai_sessions` (SQL verified; NOT yet applied — run `alembic upgrade head` where Supabase is reachable).
- [x] `POST /api/ai/sessions`, `/sessions/{id}/turns` (Whisper STT + live analysis), `/sessions/{id}/finish` (final rubric → `feedback` row) — smoke-tested live via Gemini (`gemini-3.8-flash`; `gemini-1.5-flash` is dead for this key).
- [x] `/mock-interview` setup gate + camera/mic pre-flight, browser-TTS questions, local session video (device-only, downloadable) + per-answer audio → local Whisper STT, finish → `/feedback?sessionId=`.
- [ ] Optional: `GROQ_API_KEY` as hosted STT fallback (local Whisper is primary; typed answers work with neither).
- [ ] No Storage bucket needed anymore (video never leaves the device).

### Teammate 2: Video Interview Experience (Jitsi)
- [ ] Connect the meeting room link from the booking confirmation directly to the `/video` page route with room query param.
- [ ] Add a side-by-side collaborative code/notes pane next to the Jitsi meeting iframe.

### Teammate 3: Candidate Dashboard & Past Sessions
- [ ] In `/profile`, display the candidate's active bookings (`GET /api/bookings`).
- [ ] Add a list of past interview feedback reports with direct links to view them.

### Teammate 4: Expert Dashboard & Slot Manager
- [ ] In `/expert`, allow experts to add/remove availability slots (`POST /api/experts/{id}/slots`).
- [ ] Display an expert's upcoming bookings.
