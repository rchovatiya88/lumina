# Lumina - Interior Design Product Discovery Platform

## Overview
Lumina is an interior design monetization platform that combines **curated products** with **live web search** to help users discover furniture from across the web.

## Core Value Proposition
**"Google Shopping for Interior Design"**
- Curated picks + live search across Amazon, Wayfair, IKEA & more
- AI-powered style matching (modern, boho, mid-century, etc.)
- Visual search (upload photo → find similar products)

---

## Current State (March 2025)

### What's Built
| Feature | Status | Notes |
|---------|--------|-------|
| Product Discovery Page | ✅ Live | 140+ products |
| Google Sheets CMS | ✅ Live | Real-time sync |
| Live Web Search | ✅ Live | DuckDuckGo API |
| Unified Search API | ✅ Live | Curated + Web combined |
| **Visual Search** | ✅ NEW | Upload image → find similar |
| **Price Comparison** | ✅ NEW | Same product across stores |
| **Mood Board Builder** | ✅ NEW | Drag-drop canvas |
| Affiliate Click Tracking | ⚠️ In-Memory | Needs MongoDB |
| Lead Forms | ⚠️ In-Memory | Needs persistence |
| Design Packages Page | ✅ UI Only | Needs Stripe |

### Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: FastAPI (Python)
- **Search**: ddgs (DuckDuckGo)
- **Data**: Google Sheets + JSON + MongoDB (partial)

---

## Strategic Documents

1. **LUMINA_AGENT_PROMPT.md** - Core product definition & agent task prompt
2. **LUMINA_MULTI_AGENT_PLAN.md** - 5-stream parallel execution plan

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/products/discover` | GET | Unified search (curated + web) |
| `/api/products/curated` | GET | Curated products only |
| `/api/search/products` | GET | Web search only |
| `/api/search/images` | GET | Image search |
| `/api/search/suggestions` | GET | Autocomplete suggestions |
| `/api/affiliate-click` | POST | Track product click |
| `/api/leads/consultation` | POST | Capture consultation lead |
| `/api/leads/contact` | POST | Capture contact form |
| `/api/monetization/metrics` | GET | Revenue metrics |
| `/api/products/sheets/configure` | POST | Set Google Sheet URL |

---

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, lucide-react
- **Backend**: FastAPI, Python 3.11
- **Search**: ddgs (DuckDuckGo Search)
- **Database**: MongoDB (configured, not fully utilized)
- **Hosting**: Emergent Platform

---

## Files of Reference
- `frontend/pages/Search.tsx` - Main shop page
- `frontend/App.tsx` - Routes
- `frontend/components/Layout.tsx` - Navigation
- `backend/server.py` - All API endpoints
- `frontend/src/data/imported_products.json` - Curated product database
