# Progress — PrepPilot

> Keep this a living checklist, not a diary. Check items off as they're genuinely done (built + working, not
> just started). Add new items if scope shifts.

## What works
- **Frontend Scaffolding**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Lucide icons. Production build verified with 0 errors across 11 routes.
- **Landing Page** (`/`): Modern, high-converting hero, stats, 3 core feature pillars, 4-step workflow, resume report preview, interactive FAQ, responsive navigation & footer.
- **End-to-End Auth & RBAC Flow**:
  - 3 Roles: `candidate`, `expert`, `admin`.
  - Supabase Auth + Local Dev Dual-Mode: verifies live Supabase JWTs with `SUPABASE_JWT_SECRET` when present; provides zero-config local dev tokens for fast offline iteration.
  - Role-protected endpoints via FastAPI dependencies: `get_current_user`, `require_candidate`, `require_expert`, `require_admin`.
  - Standard `{ "data": ..., "error": null }` response shape enforced for all 401, 403, and 422 errors.
  - Frontend `AuthProvider` & `useAuth` hook: session persistence in localStorage, Supabase integration, 1-click demo role switcher.
  - Automatic `Authorization: Bearer <token>` injection on all frontend API requests (`apiGet`, `apiPost`, `apiPut`, `apiUpload`).
  - Interactive Login (`/login`) with 1-click candidate, expert, and admin logins.
  - Interactive Signup (`/signup`) with candidate vs expert role selection.
  - Role-based route guard (`components/auth/ProtectedRoute.tsx`) with access restricted alerts and quick role switches.
  - Navbar (`components/Navbar.tsx`) with dynamic role badges, active role indicators, and instant role switcher dropdown.
  - Admin Console (`/admin`): live user directory, instant role change actions, and expert application approval.
  - Expert Mentorship Hub (`/expert`): credentials management, domain specialties, bio, and verification status.
- **Candidate Profile** (`/profile`): Connected to `useAuth` and backend candidate profile API with personal info, target role, experience level, target companies, and skill chips.
- **Resume Upload & Scanner** (`/resume`): Drag-and-drop PDF upload, target role specification, 4-step animated scanning progression, connected to backend `apiUpload` with client-side fallback.
- **Resume Diagnostic Report** (`/resume/report`): Executive summary, letter grade, radial overall score gauge (0-100), 4-pillar score breakdown (Impact, Technical Depth, ATS Compatibility, Structure & Brevity), detected skills grouped by category, strengths vs areas for improvement, actionable before/after bullet improvement cards with priority badges, and bridge CTA to start mock interview.
- **Backend Core**: FastAPI layered architecture (`api/`, `services/`, `models/`, `schemas/`, `core/`), standard `{ data, error }` response schema, CORS middleware, health check endpoint.
- **Resume Analysis Engine**: PDF extraction via `pypdf`, Gemini Flash integration + Groq fallback + dev mock engine for offline/free-tier resiliency, tested with real PDF payloads.
- **Documentation & Memory Bank**: PrepPilot branding across all documentation, `/memory-bank` persistent context created, `ROADMAP.md` re-sequenced.

## What's left (mirrors the MVP scope in `projectbrief.md`)

### Phase 1: Polish & Integration
- [x] Landing page (hero, features, how-it-works, FAQ)
- [x] Login & Signup pages
- [x] Candidate profile page
- [x] Resume upload page with drag-and-drop
- [x] Backend: Resume PDF extraction
- [x] Backend: AI resume analysis (Gemini/Groq/mock)
- [x] Resume diagnostic report page
- [x] Backend & frontend scaffolding
- [x] Auth with 3 roles (candidate, expert, admin)
- [x] Role-Based Access Control (RBAC) in FastAPI
- [x] Protected routes & Role-based UI in Next.js
- [x] Admin approval flow for expert applications
- [ ] Connect Supabase Auth live project credentials (when keys provided)
- [ ] Connect Postgres database via Alembic migration (when DB URL provided)

### Phase 2: AI mock interview
- [ ] Domain/role selection UI for "Practice now"
- [ ] Resume upload + Gemini-based parsing
- [ ] Adaptive question/follow-up loop
- [ ] AI-generated feedback report

### Phase 3: Expert discovery & booking
- [ ] Expert profile creation form
- [ ] Expert browse/filter page (by domain)
- [ ] Expert availability calendar (set weekly slots)
- [ ] Candidate booking flow (pick slot, confirm)
- [ ] Booking confirmation email

### Phase 4: Video sessions & expert feedback
- [ ] Jitsi room creation per booking
- [ ] Join-call UI for both candidate and expert
- [ ] Structured feedback form for experts
- [ ] Feedback report view (shared component for AI + expert feedback)

### Phase 5: Dashboards & Notifications
- [ ] Candidate dashboard (session history + trend)
- [ ] Expert dashboard (bookings + ratings)
- [ ] Email on booking confirmed
- [ ] Email/in-app reminder before session
- [ ] Email/in-app alert when feedback is ready

## Known issues
- None — all 11 frontend routes compile cleanly and all 10 backend auth & RBAC verification tests pass.
