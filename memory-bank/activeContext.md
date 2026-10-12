# Active Context — PrepPilot

> Single source of truth for current project status, recent changes, and upcoming tasks.

## Current State
- **Branch**: `candidate/profile-dashboard` (branched from `dev`)
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
   - Tested full production build (`npm run build`): all routes compile with 0 errors.

## Candidate Dashboard Feature (Teammate 3 - Akshita)
- **File**: `frontend/app/profile/page.tsx`
- **Accomplishments**:
  - Implemented candidate active & upcoming bookings display using `apiGet('/api/bookings')` with status pills, time slot formatting, and direct Jitsi video room join CTA (`/video?room=...`).
  - Implemented structured past feedback reports display with 3-pillar rubric scores (Communication, Technical Depth, Problem Solving), evaluator summary notes, key strengths, targeted improvements, and direct links to `/feedback`.
  - Added an interactive in-dashboard quick rubric inspector modal for immediate feedback review without page switching.
  - Bound authenticated user identity dynamically from `useAuth()` (full name and verified email address).
  - Built interactive interview goals & skills tag manager (add/remove skills, target companies, experience level) with `apiPut('/api/users/profile')` persistence.
  - Verified Next.js build passes with 0 errors across all routes.

## Next Tasks & Team Delegation
1. Add production OpenRouter API key to `backend/.env`.
2. Team assignments:
   - **Teammate 1 (Interviews & Questions)**: Expand questions bank & interview rubric export (`frontend/app/mock-interview/page.tsx`, `backend/app/api/ai.py`).
   - **Teammate 2 (Video & Whiteboard)**: Jitsi room query auto-join & in-call scratchpad (`frontend/app/video/page.tsx`).
   - **Teammate 3 (Akshita - Candidate Dashboard)**: Completed! Active bookings, feedback reports, and profile identity in `/profile`.
   - **Teammate 4 (Expert Management)**: Enhance `/expert` dashboard with slot availability calendar (`frontend/app/expert/page.tsx`, `backend/app/api/bookings.py`).
