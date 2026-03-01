# LUMINA: AI Agent Prompt & Product Definition

## THE ONE-LINER
**Lumina is "Google Shopping for Interior Design" - a product aggregator that combines curated picks with live web search to help people discover furniture from across the internet.**

---

## THE PROBLEM
People furnishing their homes face:
1. **Fragmentation** - Products scattered across Amazon, Wayfair, IKEA, West Elm, Target, etc.
2. **Overwhelm** - Too many choices, no curation
3. **Price opacity** - Same product at different prices on different sites
4. **Style confusion** - Hard to find products that match their aesthetic

## THE SOLUTION
A unified search interface that:
1. **Aggregates** products from the entire web in real-time
2. **Curates** hand-picked products with verified images
3. **Categorizes** by style (modern, boho, mid-century, etc.)
4. **Filters** by price, category, and store

---

## CORE DATA ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Google Sheets]          [JSON Database]      [Live Web]   │
│   - Easy curation          - 135 products      - DuckDuckGo │
│   - Real-time updates      - Scraped data      - Real-time  │
│   - No code needed         - Fallback          - Unlimited  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED SEARCH API                        │
│                  /api/products/discover                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Search CURATED products first (fast, has images)        │
│  2. Search WEB to fill gaps (live, comprehensive)           │
│  3. Combine & dedupe results                                │
│  4. Return mixed feed: curated first, web after             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  - Products marked as "CURATED" or "WEB"                    │
│  - Store badges (Wayfair, Amazon, IKEA, etc.)               │
│  - Price, category, style metadata                          │
│  - Click tracking for analytics                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## AGENT TASK PROMPT

```
You are building LUMINA - a furniture product aggregator.

CORE FOCUS: Search + Data Collection

CURRENT STATE:
- 140+ curated products (Google Sheets + JSON)
- Live web search via DuckDuckGo API
- Unified /api/products/discover endpoint
- React frontend with product grid

YOUR PRIORITIES:
1. SEARCH QUALITY - Make search results more relevant
2. DATA COLLECTION - Gather more products automatically
3. CATEGORIZATION - Better style/category detection
4. DEDUPLICATION - Same product from multiple stores

DO NOT FOCUS ON (for now):
- User authentication
- Payment processing
- Email notifications
- Admin dashboards

TECHNICAL STACK:
- Backend: FastAPI (Python)
- Frontend: React + Vite + TailwindCSS
- Search: ddgs (DuckDuckGo)
- Data: Google Sheets (live) + JSON (fallback)
- Database: MongoDB (available but not fully utilized)

KEY FILES:
- /app/backend/server.py - All API logic
- /app/frontend/pages/Search.tsx - Main UI
- /app/frontend/src/data/imported_products.json - Product database

IMPROVEMENT IDEAS:
1. Add more product sources (scrape furniture sites?)
2. Image similarity search (upload photo, find product)
3. Price tracking over time
4. Better AI categorization (use LLM to detect style)
5. Product recommendations ("people also viewed")
6. Mood board builder (drag products to canvas)
```

---

## DATA COLLECTION STRATEGY

### Current Sources
| Source | Products | Quality | Update Frequency |
|--------|----------|---------|------------------|
| Google Sheets | 5 | High (curated) | Real-time |
| JSON file | 135 | Medium (scraped) | Manual |
| DuckDuckGo | Unlimited | Variable | Real-time |

### Expansion Opportunities
1. **Scrape product feeds** - IKEA, Wayfair have public APIs/feeds
2. **Image search** - Find products by uploading photos
3. **Social curation** - Pull trending products from Pinterest/Instagram
4. **Price comparison** - Track same product across stores
5. **User submissions** - Let users add products they find

---

## SUCCESS METRICS

1. **Search Quality**: % of searches returning 10+ relevant products
2. **Product Coverage**: Total unique products in database
3. **Click-through Rate**: % of product views → store visits
4. **Return Visitors**: Users who come back to search again

---

## THE MOAT

What makes Lumina defensible:
1. **Curation quality** - Hand-picked products beat raw search
2. **Style matching** - AI categorization by aesthetic
3. **Cross-store comparison** - See same product on multiple sites
4. **Community** - User-submitted products + reviews (future)

---

## NEXT ITERATION FOCUS

```
GOAL: Improve search quality and expand product database

TASKS:
[ ] Add AI-powered style detection (use Gemini/GPT to analyze product text)
[ ] Implement price extraction from web results
[ ] Add image search capability (upload photo → find similar)
[ ] Create automated product scraper for top furniture sites
[ ] Build price tracking for products over time
[ ] Add "similar products" recommendations
```

---

## SAMPLE QUERIES TO OPTIMIZE FOR

- "velvet sofa under $1000"
- "mid century modern dining table"
- "boho rattan chair"
- "minimalist floor lamp"
- "japandi coffee table"
- "affordable accent chair"
- "small space furniture"
- "apartment sofa"
