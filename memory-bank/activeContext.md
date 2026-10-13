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
### Payoshnee T1 update (2026-10-13)
- On `ai/interview-transcript` (based on `dev`), the mock interview now starts without a fabricated candidate answer and has an **End Interview** action.
- `POST /api/ai/interview/rubric` scores completed text answers on communication, technical depth, problem solving, and STAR; it averages per-answer scores. If configured AI providers are unavailable or return invalid JSON, a clearly labelled text heuristic is used.
- Ending the interview posts scores and the full transcript into the existing PostgreSQL feedback record (`feedback.comments`) and opens `/feedback?session=<id>`; the feedback page loads that session automatically.
- Restored the missing `frontend/lib/utils.ts` class-name helper and adjusted `.gitignore` so the file can be tracked. This fixes an existing `dev` build failure in login/signup.
- Backend rubric tests and existing endpoint tests pass. Frontend production build passes. No database schema or auth middleware was changed.
- Next: merge this PR into `dev`; the other teammate assignments below remain open.

1. Add production OpenRouter API key to `backend/.env`.
2. Team assignments:
   - **Teammate 1 (Interviews & Questions)**: Expand questions bank & interview rubric export.
   - **Teammate 2 (Video & Whiteboard)**: Test and polish multi-user Jitsi room controls.
   - **Teammate 3 (Candidate Dashboard)**: Build candidate bookings history tab in `/profile`.
   - **Teammate 4 (Expert Management)**: Enhance `/expert` dashboard with slot availability calendar.
