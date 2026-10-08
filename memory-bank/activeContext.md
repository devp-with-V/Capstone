# Active Context — PrepPilot

> Update this file at the end of every work session, however small. This is the file that lets a teammate's
> agent session (or your own, a week later) pick up exactly where things were left off instead of re-deriving
> context from scratch or guessing.

## Current phase
Phase 1 — Landing, Candidate Profile, Authentication & Role-Based Authorization

## Current focus
Full End-to-End Role-Based Access Control (RBAC) & Authentication implemented across Next.js and FastAPI with dual-mode support (Supabase Auth + local zero-config dev tokens).

## Recent decisions
- Implemented 3 platform roles: `candidate`, `expert`, `admin`.
- Implemented Dual-Mode Auth: supports live Supabase Auth JWT verification (`SUPABASE_JWT_SECRET`) when configured, alongside seamless zero-config local dev tokens with 1-click role switching for testing.
- Standardized FastAPI exception handlers so all 401, 403, and 422 errors strictly follow `{ "data": null, "error": { "message": "..." } }`.
- Frontend API client (`lib/api.ts`) automatically injects `Authorization: Bearer <token>` into all HTTP requests (`apiGet`, `apiPost`, `apiPut`, `apiUpload`).
- Added client-side role guards via `components/auth/ProtectedRoute.tsx` and header navigation role switcher in `components/Navbar.tsx`.

## Recent accomplishments
- **Backend Authorization & RBAC**:
  - `app/models/user.py`: updated `User` table with `role` index, added `CandidateProfile` and `ExpertProfile` models.
  - `app/core/security.py`: implemented token decoding (Supabase HS256 JWT, local dev fallback, demo role tokens), user sync, and role dependencies (`require_candidate`, `require_expert`, `require_admin`).
  - `app/api/auth.py`: role-aware `/api/auth/signup`, `/api/auth/login`, `/api/auth/demo-login`, and `/api/auth/me`.
  - `app/api/users.py`: added candidate `/api/users/profile`, expert `/api/users/expert/profile`, and admin endpoints (`/api/users/admin/users`, `/api/users/admin/change-role`, `/api/users/admin/approve-expert`).
  - `app/main.py`: standard exception handlers for StarletteHTTPException and validation errors.
  - Verification: 10/10 test suite passing (unauthenticated 401, candidate access, expert access, candidate 403 forbidden on admin, admin 200 OK, dynamic role promotions, and expert verification).
- **Frontend Authorization**:
  - `lib/types.ts`: added `UserRole`, `User`, `AuthResponse`, `CandidateProfile`, `ExpertProfile`.
  - `lib/supabase.ts`: safe initialization with fallback URL preventing static build crashes when keys are absent.
  - `lib/auth-context.tsx`: `AuthProvider` & `useAuth` hook managing token, user session, Supabase integration, and demo logins.
  - `lib/api.ts`: automatic `Authorization: Bearer` header attachment.
  - `components/Navbar.tsx`: role pill badges, dev role switcher dropdown, and role-based links.
  - `components/auth/ProtectedRoute.tsx`: route guard with role restriction alerts and one-click role switching.
  - `app/login/page.tsx`: connected to `useAuth`, error alerts, and 1-click candidate/expert/admin logins.
  - `app/signup/page.tsx`: connected to `useAuth` with interactive candidate vs expert role selection.
  - `app/admin/page.tsx`: admin control console showing user directory, role promotions, and expert approvals.
  - `app/expert/page.tsx`: expert hub showing domain specialties, rating, and verification badge.
  - Verification: Next.js production build passes with 0 errors across all 11 routes.

## Next steps
1. When team member or user is ready, connect live Supabase credentials in `frontend/.env.local` and `backend/.env`.
2. Advance to Phase 2: AI Mock Interview module (adaptive question generation based on resume gaps, speech/text response handling, and live feedback scoring).

## Open questions (resolve before Phase 1 ends)
- Exact scoring rubric for feedback (what does a "technical_score" of 7/10 mean, concretely?) — needs a
  written rubric so AI-generated and expert-authored feedback stay comparable.
- Credits system mechanics: do candidates get a fixed number per week, or earn them somehow?
