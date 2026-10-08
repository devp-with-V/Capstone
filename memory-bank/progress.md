# Progress — PrepPilot

> Keep this a living checklist, not a diary. Check items off as they're genuinely done (built + working, not
> just started). Add new items if scope shifts.

## What works
- **Frontend Scaffolding**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Lucide icons. Production build verified with 0 errors.
- **Landing Page** (`/`): Modern, high-converting hero, stats, 3 core feature pillars, 4-step workflow, resume report preview, interactive FAQ, responsive navigation & footer.
- **Auth Flow** (`/login`, `/signup`): Authentication pages with candidate/expert role selection and guest/demo flow.
- **Candidate Profile** (`/profile`): Personal info, target role, experience level, target companies, key skill chips, recent reports sidebar, interview cards.
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
- [ ] Connect Supabase Auth live project credentials
- [ ] Connect Postgres database via Alembic migration

### Auth & users
- [ ] Supabase Auth wired into Next.js (signup/login/logout)
- [ ] Role selection (candidate/expert) on signup
- [ ] Admin approval flow for expert applications

### Expert discovery
- [ ] Expert profile creation form
- [ ] Expert browse/filter page (by domain)

### Booking & availability
- [x] Expert availability calendar (set weekly slots)
- [x] Candidate booking flow (pick slot, confirm)
- [ ] Booking confirmation email

### Video sessions
- [ ] Jitsi room creation per booking
- [ ] Join-call UI for both candidate and expert

### AI interviewer
- [ ] Domain/role selection UI for "Practice now"
- [ ] Resume upload + Gemini-based parsing
- [ ] Adaptive question/follow-up loop
- [ ] AI-generated feedback report

### Feedback & dashboards
- [ ] Structured feedback form for experts
- [ ] Feedback report view (shared component for AI + expert feedback)
- [ ] Candidate dashboard (session history + trend)
- [ ] Expert dashboard (bookings + ratings)

### Notifications
- [ ] Email on booking confirmed
- [ ] Email/in-app reminder before session
- [ ] Email/in-app alert when feedback is ready

## Known issues
- None yet — nothing built.
