# Active Context — PrepPilot

> Update this file at the end of every work session, however small. This is the file that lets a teammate's
> agent session (or your own, a week later) pick up exactly where things were left off instead of re-deriving
> context from scratch or guessing.

## Current phase
Phase 1 — Landing, Candidate Profile & Resume Intelligence

## Current focus
Building end-to-end resume analysis flow (landing page → auth → profile → resume upload → AI scoring → report display)

## Recent decisions
- Project renamed to PrepPilot. Roadmap re-sequenced to deliver end-to-end resume intelligence as Phase 1 before interview features.
- Stack locked: Next.js + FastAPI (Python), Supabase for DB/Auth/Storage, Gemini (primary) + Groq (fallback)
  for AI, Jitsi for video.
- Expert model confirmed as hybrid: real experts AND an AI interviewer, not either/or.
- Team of 5 — module ownership proposed in `ROADMAP.md`, not yet confirmed with actual names.
- Payments explicitly out of scope for MVP — using a credits system instead of real money.

## Recent accomplishments
- Booking and availability module added on `booking/expert-availability-flow`: expert discovery API,
  future availability slots, atomic slot reservation, booking records, Alembic migration, and `/booking` UI.
- Phase 1 End-to-End Candidate flow built and tested:
  - High-converting Landing page (`/`)
  - Login & Signup pages (`/login`, `/signup`)
  - Candidate Profile page (`/profile`)
  - Resume Upload scanner with drag & drop and animated scanner (`/resume`)
  - Resume Diagnostic Report with radial score, 4-pillar breakdown, strengths/weaknesses, actionable suggestions, and mock interview CTA (`/resume/report`)
  - FastAPI backend (`/backend`) with async architecture, standard `{ data, error }` response schema, PDF text extractor (`pypdf`), and Gemini/Groq/mock AI resume analyzer
  - Verification: Frontend Next.js build passes with 0 errors across all 9 routes; Backend API endpoints (`/api/health`, `/api/resume/sample`, `/api/resume/analyze`, `/api/auth/me`, `/api/users/profile`) tested and passing with actual PDF payloads.

## Next steps
1. User provides or connects Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`) and AI keys (`GEMINI_API_KEY`, `GROQ_API_KEY`) when ready.
2. Advance to Phase 2: AI Mock Interview module (adaptive question generation based on resume gaps, speech/text response handling, and live feedback scoring).
3. Apply the booking migration after the shared Postgres/Supabase database is configured, then connect the
   authenticated user id to the booking endpoints instead of the temporary development query parameter.

## Open questions (resolve before Phase 1 ends)
- Exact scoring rubric for feedback (what does a "technical_score" of 7/10 mean, concretely?) — needs a
  written rubric so AI-generated and expert-authored feedback stay comparable.
- Credits system mechanics: do candidates get a fixed number per week, or earn them somehow?
