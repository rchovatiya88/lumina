# Lumina - Interior Design Product Discovery Platform

## Overview
Lumina is an interior design monetization platform that combines **curated products** with **live web search** to help users discover furniture from across the web.

## Core Value Proposition
**"Curated picks + live search across Amazon, Wayfair, IKEA & more"**

Users can:
1. Browse 135+ hand-curated products with verified images
2. Search the entire web for furniture in real-time
3. Filter by category, style, and price
4. Save favorites to collections
5. Click through to buy (affiliate tracking enabled)

---

## Current Features

### 1. Unified Shop Page (`/search`)
- **Curated Products**: 135+ products from JSON database
- **Live Web Search**: DuckDuckGo-powered search across all furniture sites
- **Combined Results**: Shows curated first, then fills with web results
- **Filters**: Category, Style, Price Range
- **Save/Like**: Heart icon to save products to collection
- **Product/Images Toggle**: Switch between product cards and image grid

### 2. Google Sheets Integration (Ready)
- API endpoint `/api/products/sheets/configure` to set Sheet URL
- Products from public Google Sheet merged with JSON curated list
- 5-minute cache for Sheet data

### 3. Monetization (In-Memory)
- Affiliate click tracking: `/api/affiliate-click`
- Consultation leads: `/api/leads/consultation`  
- Contact leads: `/api/leads/contact`
- Metrics dashboard: `/api/monetization/metrics`

### 4. Other Pages
- **Home**: Landing page with feature highlights
- **Trends/Journal**: Content marketing section
- **Services**: Design package pricing ($149 / $599 / $1,500+)
- **About**: Company story
- **Contact**: Contact form
- **Dashboard**: Analytics overview

---

## Architecture

```
Frontend (React + Vite + TailwindCSS)
├── /search (Shop) - Unified product discovery
├── /services - Design packages
├── /journal - Trends content
├── /about, /contact, /dashboard, /login

Backend (FastAPI + Python)
├── /api/products/discover - Unified curated + web search
├── /api/products/curated - Curated products only
├── /api/search/products - Web search only
├── /api/search/images - Image search
├── /api/affiliate-click - Click tracking
├── /api/leads/* - Lead capture

Data Sources:
├── JSON file: /frontend/src/data/imported_products.json (135 products)
├── Google Sheets: Configurable public sheet URL
├── DuckDuckGo: Live web search
```

---

## What's Been Implemented (March 1, 2025)

### Session 1: Cleanup
- Fixed 502 error (missing lottie-react)
- Removed AI Quiz and 3D Builder features
- Cleaned up dead code

### Session 2: Search Aggregator
- Built live product search using DuckDuckGo API
- Created Search page with product grid
- Added image search capability
- Integrated affiliate click tracking

### Session 3: Unified Shop Experience
- Merged Studio and Search into one "Shop" page
- Combined curated products (JSON) with live web search
- Products from curated database appear FIRST
- Web results fill remaining slots
- Added visual badges: "Curated" vs "Web"
- Google Sheets integration ready (needs public sheet URL)

---

## Monetization Strategy

| Revenue Stream | Status | Implementation |
|---------------|--------|----------------|
| Affiliate Commissions | Ready | Click tracking in place, needs real affiliate links |
| Design Packages | Ready | $149 / $599 / $1,500+ tiers on Services page |
| Consultation Leads | Ready | Form captures to /api/leads/consultation |
| Newsletter | Partial | Modal exists, needs email service integration |

---

## Next Steps (Prioritized)

### P0 - Make Money Now
1. **Add Real Affiliate Links**: Sign up for Amazon Associates, Wayfair (via CJ Affiliate)
2. **Update Curated Products**: Replace placeholder `#` links with real affiliate URLs
3. **Set Up Google Sheet**: Create public sheet with columns: name, price, image, store, category, style, affiliate_link

### P1 - Persist Data
4. **MongoDB Integration**: Persist affiliate clicks, leads, user preferences
5. **User Authentication**: JWT or Google OAuth for saved collections

### P2 - Growth
6. **Email Service**: SendGrid/Resend for newsletter and lead follow-up
7. **Stripe Integration**: Accept payments for design packages
8. **SEO Optimization**: Meta tags, sitemap, structured data

### P3 - Future
9. **Mood Board Builder**: Drag-and-drop room designer
10. **AI Room Styling**: Upload photo, get product recommendations
11. **Admin Dashboard**: Manage products, view analytics, export data

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
