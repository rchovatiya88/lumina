# Lumina Monetization PRD

## Original Problem Statement
"your job is to help us make money making this lumina app githubcode provided - the screenshot attached are review - go through images and the app and slowly step by step figure out to update the app and figure out a way to make money"

## Architecture Decisions
- Kept React + Vite frontend at `/app/frontend` aligned with supervisor runtime.
- Added lightweight FastAPI monetization backend at `/app/backend/server.py`.
- Frontend monetization API calls use `REACT_APP_BACKEND_URL` with relative fallback.
- Per latest user directive, removed AI Quiz and 3D Builder from both UI and code.
- Simplified header taxonomy to short labels: **Studio** and **Trends**.

## What’s Implemented
- Runtime/preview stabilized (previous 502 issue resolved).
- Monetization flows live: affiliate click tracking, consultation lead capture, contact lead capture, and metrics endpoint.
- Studio improvements: budget filters (under $100/$300/$500), ratings sort, disclosure, and revenue chip.
- New About + Contact pages and updated navigation order.
- Cleanup completed:
  - Removed AI Quiz route/page and related UI links/CTAs.
  - Removed 3D Builder route/page and related UI links/CTAs.
  - Deleted related frontend files: `AIStyleQuiz.tsx`, `RoomDesign.tsx`, `ApartmentArchitecture.tsx`, `MoodboardStudio.tsx`, `ProductClipper.tsx`.
  - Removed quiz-specific service logic (`getStyleAdvice`).
- Header rename update completed:
  - `Studio / Shopping` -> `Studio`
  - `Inspiration / Trends / Blog` -> `Trends`

## Prioritized Backlog
### P0
- Persist monetization events/leads in database (currently in-memory).
- Replace placeholder affiliate URLs with real partner links.
- Add owner-facing revenue + lead analytics dashboard.

### P1
- Add UTM/source attribution for each click and lead.
- Add automated lead follow-up emails.
- Add coordination-service booking workflow and pricing packages.

### P2
- Add SEO-friendly blog CMS workflow for growth.
- Add campaign landing variants for social channels.
- Add conversion A/B testing for hero and pricing CTAs.

## Next Tasks
1. Connect real affiliate programs and verified outbound links.
2. Persist metrics/leads in DB and expose export/download tools.
3. Build a simple CRM-style lead board with status tracking.
4. Launch email automation to improve booking conversion.
