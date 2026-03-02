# Lumina - Interior Design Product Discovery Platform

## Overview
Lumina is an interior design monetization platform that combines **curated products** with **live web search** to help users discover furniture from across the web.

## Core Value Proposition
**"Google Shopping for Interior Design"**
- Curated picks + live search across Amazon, Wayfair, IKEA & more
- AI-powered style matching (modern, boho, mid-century, etc.)
- Visual search (upload photo -> find similar products)
- **Live price comparison across 10+ retail stores**

---

## Current State (March 2025)

### What's Built
| Feature | Status | Notes |
|---------|--------|-------|
| Product Discovery Page | Live | 135+ curated products |
| Google Sheets CMS | Live | Real-time sync |
| Live Web Search | Live | DuckDuckGo API |
| Unified Search API | Live | Curated + Web combined |
| Visual Search | UI Ready | Upload image -> find similar (CLIP model backend) |
| **Price Comparison** | **Live** | **Real-time DuckDuckGo lookups across 10+ stores** |
| Mood Board Builder | UI Ready | Drag-drop canvas (in-memory storage) |
| Affiliate Click Tracking | In-Memory | Needs MongoDB |
| Lead Forms | In-Memory | Needs persistence |
| Design Packages Page | UI Only | Needs Stripe |

### Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: FastAPI (Python)
- **Search**: ddgs (DuckDuckGo)
- **Data**: Google Sheets + JSON + MongoDB (partial)

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/products/discover` | GET | Unified search (curated + web) |
| `/api/products/curated` | GET | Curated products only |
| `/api/products/compare` | GET | **Live price comparison across stores** |
| `/api/products/grouped` | GET | Products grouped for comparison (supports `live=true`) |
| `/api/search/products` | GET | Web search only |
| `/api/search/images` | GET | Image search |
| `/api/search/suggestions` | GET | Autocomplete suggestions |
| `/api/search/visual` | POST | Visual search by image |
| `/api/affiliate-click` | POST | Track product click |
| `/api/leads/consultation` | POST | Capture consultation lead |
| `/api/leads/contact` | POST | Capture contact form |
| `/api/monetization/metrics` | GET | Revenue metrics |
| `/api/moodboards` | GET/POST | List/Create mood boards |

---

## Files of Reference
- `frontend/pages/Search.tsx` - Main shop page
- `frontend/components/PriceComparison.tsx` - Live price comparison modal
- `frontend/components/VisualSearch.tsx` - Visual search modal
- `frontend/App.tsx` - Routes (HashRouter)
- `frontend/components/Layout.tsx` - Navigation
- `backend/server.py` - All API endpoints
- `frontend/src/data/imported_products.json` - Curated product database

## Upcoming Tasks
- **P0**: Implement Visual Search backend with real image similarity (CLIP model)
- **P0**: Connect Mood Board to MongoDB for persistence
- **P1**: User Authentication (Sign up/Login)
- **P1**: Scale data aggregation (SerpAPI or dedicated scraping)
- **P2**: Monetization (affiliate links, Stripe for design packages)
- **P2**: SEO and traction strategies
