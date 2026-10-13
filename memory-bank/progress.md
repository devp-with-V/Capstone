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

### Pages & Routing (0 Broken Links / 0 404s)
- [x] `/` (Landing Page with Login / Signup header and active CTAs)
- [x] `/login` & `/signup`
- [x] `/resume` & `/resume/report`
- [x] `/mock-interview`
- [x] `/mentors` & `/booking`
- [x] `/feedback`
- [x] `/video`
- [x] `/profile`
- [x] `/expert`
- [x] `/admin`
- [x] `/jd-analyzer`
- [x] `/report`
- [x] `/jobs`
- [x] `/teams`

---

## Remaining Work (Team Delegation Plan)

### Teammate 1: AI Mock Interview Polish & Rubric Export
- [x] Save completed interview conversation transcripts in PostgreSQL through the existing feedback record's `comments` field.
- [x] Implement an automated "End Interview & Generate Rubric" action in `/mock-interview` that posts to `/api/feedback` and opens the matching report.
- [x] Average STAR and three rubric dimensions across actual candidate answers; exclude scratchpad messages from scoring.

### Teammate 2: Video Interview Experience (Jitsi)
- [ ] Connect the meeting room link from the booking confirmation directly to the `/video` page route with room query param.
- [ ] Add a side-by-side collaborative code/notes pane next to the Jitsi meeting iframe.

### Teammate 3: Candidate Dashboard & Past Sessions
- [ ] In `/profile`, display the candidate's active bookings (`GET /api/bookings`).
- [ ] Add a list of past interview feedback reports with direct links to view them.

### Teammate 4: Expert Dashboard & Slot Manager
- [ ] In `/expert`, allow experts to add/remove availability slots (`POST /api/experts/{id}/slots`).
- [ ] Display an expert's upcoming bookings.
