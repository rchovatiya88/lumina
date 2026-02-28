# Lumina Monetization PRD

## Original Problem Statement
"your job is to help us make money making this lumina app githubcode provided - the screenshot attached are review - go through images and the app and slowly step by step figure out to update the app and figure out a way to make money"

## Architecture Decisions
- Kept current React + Vite frontend and aligned it to supervisor runtime at `/app/frontend`.
- Added lightweight FastAPI backend at `/app/backend/server.py` for monetization events and lead capture APIs.
- Used env-driven frontend API base (`REACT_APP_BACKEND_URL`) with safe relative fallback.
- Preserved existing visual language; added pages and flows required by handwritten notes.

## What Was Implemented
- Fixed preview availability issues (502): startup path/script mismatch, host allowlist, frontend/backend runtime wiring.
- Navigation/order updates based on notes: Home, Studio/Shopping, 3D Builder, Inspiration/Trends/Blog, Services, AI Quiz, plus new About + Contact.
- Added monetization backend APIs:
  - `POST /api/affiliate-click`
  - `POST /api/leads/consultation`
  - `POST /api/leads/contact`
  - `GET /api/monetization/metrics`
- Studio monetization upgrades:
  - budget chips (All, under $100/$300/$500)
  - ratings sort option
  - affiliate disclosure
  - affiliate click tracking on product outbound links
  - live revenue metrics chip
- Services page: consultation lead form integrated to backend.
- Contact page: contact lead form integrated to backend.
- About page added with business model framing.
- Journal page updated with trend/content roadmap section.
- Added/updated test IDs on newly added critical interactive flows.

## Prioritized Backlog
### P0
- Persist affiliate clicks + leads in database (currently in-memory and resets on restart).
- Add admin dashboard for lead management + conversion funnel.
- Replace placeholder affiliate URLs (`#`) with real partner links.

### P1
- Add UTM/referral attribution fields and per-channel analytics.
- Add email automation for contact + consultation responses.
- Add vendor coordination booking workflow with pricing packages.

### P2
- Add SEO-ready blog CMS workflow for growth content cadence.
- Add influencer/social campaign landing sections (Pinterest/Instagram/TikTok/LinkedIn).
- Add A/B testing for CTA positioning and package pricing cards.

## Next Tasks
1. Connect real affiliate providers and populate verified product links.
2. Add persistent storage for monetization events/leads.
3. Build owner analytics dashboard for clicks, leads, and estimated revenue by source/store.
4. Launch automated follow-up emails to improve lead-to-consultation conversion.
