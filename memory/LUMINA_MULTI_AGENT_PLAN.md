# LUMINA: Multi-Agent Parallel Execution Plan
## Deep Research Synthesis + Strategic Roadmap

---

## 🧠 CORE INSIGHT FROM RESEARCH

**The winning formula = Feed-Driven Aggregation + AI Enrichment + Visual Search**

Google Shopping works by:
1. **Merchant feeds** (structured product data) → Normalized → Indexed
2. **AI matching** (semantic, not just keywords)
3. **Multi-channel distribution**

Lumina can replicate this at smaller scale with:
1. **Curated feeds** (Google Sheets + JSON) + **Live search** (DuckDuckGo)
2. **AI enrichment** (LLM for style detection, CLIP for visual similarity)
3. **Single optimized channel** (the Shop page)

---

## 🎯 THE 5 PARALLEL WORK STREAMS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     LUMINA MULTI-AGENT ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STREAM 1          STREAM 2          STREAM 3          STREAM 4         │
│  DATA INGESTION    AI ENRICHMENT     VISUAL SEARCH     SEARCH QUALITY   │
│  ─────────────     ─────────────     ─────────────     ─────────────    │
│  • Scraper agent   • Style AI        • CLIP embeddings • Query parser   │
│  • Feed normalizer • Category AI     • Vector DB       • Ranking algo   │
│  • Deduplicator    • Price extractor • Image upload    • Filters        │
│                                                                          │
│                              │                                           │
│                              ▼                                           │
│                     ┌─────────────────┐                                  │
│                     │  STREAM 5       │                                  │
│                     │  ORCHESTRATOR   │                                  │
│                     │  ─────────────  │                                  │
│                     │  • API gateway  │                                  │
│                     │  • Caching      │                                  │
│                     │  • Rate limits  │                                  │
│                     └─────────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 STREAM 1: DATA INGESTION AGENT

### Goal: 10x the product database (140 → 1,400+ products)

### Sub-Tasks (Parallel):
```
┌─────────────────────────────────────────────────────────────┐
│  TASK 1.1: Wayfair Affiliate Feed                          │
│  ─────────────────────────────────────────────────────────  │
│  • Sign up for CJ Affiliate → Wayfair program              │
│  • Access product feed (CSV/XML)                           │
│  • Parse: name, price, image, category, affiliate_link     │
│  • Import to MongoDB                                        │
│  • LEGAL: Use official affiliate feed, not scraping        │
│  • OUTPUT: 10,000+ Wayfair products                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 1.2: Amazon Product Advertising API                  │
│  ─────────────────────────────────────────────────────────  │
│  • Sign up for Amazon Associates                            │
│  • Apply for PAAPI 5.0 access (requires 3 sales)           │
│  • Search by keyword: "modern sofa", "boho lamp", etc.     │
│  • Pull: ASIN, title, price, images, affiliate link        │
│  • Import to MongoDB                                        │
│  • OUTPUT: 5,000+ Amazon products                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 1.3: Google Sheets Bulk Import                       │
│  ─────────────────────────────────────────────────────────  │
│  • Create template sheets by category:                     │
│    - sofas.csv, chairs.csv, tables.csv, etc.               │
│  • Hire VA on Upwork to populate (500 products @ $50)      │
│  • Validate images are real URLs                           │
│  • Auto-sync to backend                                     │
│  • OUTPUT: 500+ curated products                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 1.4: Deduplication Pipeline                          │
│  ─────────────────────────────────────────────────────────  │
│  • Same product appears on Amazon + Wayfair + Target       │
│  • Use fuzzy matching on product names                     │
│  • Group by: cleaned_name + dimensions + material          │
│  • Store as single product with multiple "sources"         │
│  • OUTPUT: Clean, deduplicated catalog                     │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Code (Task 1.4 - Deduplication):
```python
from fuzzywuzzy import fuzz
import re

def clean_product_name(name: str) -> str:
    """Normalize product name for matching"""
    name = name.lower()
    name = re.sub(r'[^\w\s]', '', name)  # Remove special chars
    name = re.sub(r'\b(amazon|wayfair|ikea|target)\b', '', name)  # Remove store
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def find_duplicates(products: list) -> dict:
    """Group products by similarity"""
    groups = {}
    for p in products:
        clean_name = clean_product_name(p['name'])
        matched = False
        for key in groups:
            if fuzz.ratio(clean_name, key) > 85:  # 85% similar
                groups[key].append(p)
                matched = True
                break
        if not matched:
            groups[clean_name] = [p]
    return groups
```

---

## 🤖 STREAM 2: AI ENRICHMENT AGENT

### Goal: Auto-categorize every product by style, category, material

### Sub-Tasks (Parallel):
```
┌─────────────────────────────────────────────────────────────┐
│  TASK 2.1: LLM Style Detection                             │
│  ─────────────────────────────────────────────────────────  │
│  • Use Gemini/GPT to analyze product name + description    │
│  • Classify into: modern, boho, mid-century, scandi, etc.  │
│  • Batch process 100 products at a time                    │
│  • Cache results in MongoDB                                 │
│  • COST: ~$0.001 per product (Gemini Flash)                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 2.2: Category Detection                              │
│  ─────────────────────────────────────────────────────────  │
│  • Parse product names for furniture type                  │
│  • Categories: sofa, chair, table, bed, lamp, rug, etc.    │
│  • Use keyword matching + LLM fallback                     │
│  • Store normalized category                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 2.3: Price Extraction                                │
│  ─────────────────────────────────────────────────────────  │
│  • Web results often have price in title/description       │
│  • Regex patterns: $X,XXX.XX, X USD, etc.                  │
│  • Normalize to float                                       │
│  • Flag products with missing/suspicious prices            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 2.4: Material/Color Detection                        │
│  ─────────────────────────────────────────────────────────  │
│  • Extract: velvet, leather, wood, metal, fabric           │
│  • Extract: blue, green, gray, natural, walnut             │
│  • Enable filters: "blue velvet sofa"                      │
│  • Use LLM for ambiguous cases                              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Code (Task 2.1 - Style Detection):
```python
from emergentintegrations.llm.gemini import GeminiClient, GeminiConfig

STYLE_PROMPT = """
Classify this furniture product into ONE style category.

Product: {name}
Description: {description}

Categories:
- modern (clean lines, minimalist, contemporary)
- boho (bohemian, eclectic, rattan, macrame)
- mid-century (MCM, retro, 1950s-60s inspired)
- scandi (Scandinavian, nordic, hygge, light wood)
- industrial (metal, rustic, raw, warehouse)
- glam (luxe, velvet, gold accents, Hollywood)
- coastal (beach, nautical, light, airy)
- farmhouse (rustic, country, barn, shiplap)
- japandi (Japanese + Scandinavian, zen, minimal)
- traditional (classic, ornate, timeless)

Respond with ONLY the category name, nothing else.
"""

async def detect_style(name: str, description: str = "") -> str:
    config = GeminiConfig(model="gemini-2.0-flash")
    client = GeminiClient(config)
    
    prompt = STYLE_PROMPT.format(name=name, description=description)
    response = await client.generate(prompt)
    
    style = response.strip().lower()
    valid_styles = ['modern', 'boho', 'mid-century', 'scandi', 'industrial', 
                    'glam', 'coastal', 'farmhouse', 'japandi', 'traditional']
    
    return style if style in valid_styles else 'modern'
```

---

## 🖼️ STREAM 3: VISUAL SEARCH AGENT

### Goal: Upload image → Find similar products

### Sub-Tasks (Sequential):
```
┌─────────────────────────────────────────────────────────────┐
│  TASK 3.1: CLIP Embedding Pipeline                         │
│  ─────────────────────────────────────────────────────────  │
│  • Install: transformers, torch, faiss-cpu                 │
│  • Load CLIP model (openai/clip-vit-base-patch32)          │
│  • Generate embeddings for all catalog images              │
│  • Store in vector DB (MongoDB Atlas Search or FAISS)      │
│  • COMPUTE: ~1 sec per image on CPU                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 3.2: Image Upload API                                │
│  ─────────────────────────────────────────────────────────  │
│  • Endpoint: POST /api/search/visual                       │
│  • Accept: image file or URL                               │
│  • Generate CLIP embedding                                  │
│  • Query vector DB for top 20 similar                      │
│  • Return products with similarity scores                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 3.3: Frontend Integration                            │
│  ─────────────────────────────────────────────────────────  │
│  • Add "Search by Image" button                            │
│  • Camera icon + file upload                               │
│  • Show results in same grid                               │
│  • Badge: "Visually Similar"                               │
└─────────────────────────────────────────────────────────────┘
```

### Architecture:
```
User uploads image
        │
        ▼
┌─────────────────┐
│  CLIP Encoder   │ → 512-dim vector
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  FAISS Index    │ → k-NN search
└─────────────────┘
        │
        ▼
Top 20 similar products
```

---

## 🔍 STREAM 4: SEARCH QUALITY AGENT

### Goal: Make search results more relevant

### Sub-Tasks (Parallel):
```
┌─────────────────────────────────────────────────────────────┐
│  TASK 4.1: Query Understanding                             │
│  ─────────────────────────────────────────────────────────  │
│  • Parse: "blue velvet sofa under $1000"                   │
│  • Extract: color=blue, material=velvet, category=sofa     │
│  • Extract: max_price=$1000                                │
│  • Apply filters automatically                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 4.2: Ranking Algorithm                               │
│  ─────────────────────────────────────────────────────────  │
│  • Current: curated first, then web                        │
│  • Improved:                                                │
│    - Relevance score (query match)                         │
│    - Image quality (has real image > placeholder)          │
│    - Price availability (has price > no price)             │
│    - Source trust (Wayfair > random web)                   │
│  • Weighted formula: rank = Σ(weight_i × score_i)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 4.3: Search Suggestions                              │
│  ─────────────────────────────────────────────────────────  │
│  • Track popular searches                                   │
│  • Show trending: "People also search for..."              │
│  • Autocomplete from product catalog                       │
│  • Spell correction                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK 4.4: "Similar Products" Panel                        │
│  ─────────────────────────────────────────────────────────  │
│  • When viewing product, show:                             │
│    - Same product at other stores (price comparison)       │
│    - Similar style products                                 │
│    - "Complete the look" (matching furniture)              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Code (Task 4.1 - Query Parser):
```python
import re

def parse_search_query(query: str) -> dict:
    """Extract structured filters from natural language query"""
    result = {
        'text': query,
        'category': None,
        'style': None,
        'color': None,
        'material': None,
        'max_price': None,
        'min_price': None,
    }
    
    # Price extraction
    price_match = re.search(r'under\s*\$?(\d+)', query, re.I)
    if price_match:
        result['max_price'] = int(price_match.group(1))
        query = re.sub(r'under\s*\$?\d+', '', query)
    
    price_match = re.search(r'over\s*\$?(\d+)', query, re.I)
    if price_match:
        result['min_price'] = int(price_match.group(1))
        query = re.sub(r'over\s*\$?\d+', '', query)
    
    # Style extraction
    styles = ['modern', 'boho', 'mid-century', 'scandi', 'industrial', 'glam', 'coastal']
    for style in styles:
        if style in query.lower():
            result['style'] = style
            query = re.sub(style, '', query, flags=re.I)
            break
    
    # Color extraction
    colors = ['blue', 'green', 'gray', 'grey', 'white', 'black', 'brown', 'beige', 'navy']
    for color in colors:
        if color in query.lower():
            result['color'] = color
            break
    
    # Material extraction
    materials = ['velvet', 'leather', 'wood', 'metal', 'fabric', 'rattan', 'marble']
    for material in materials:
        if material in query.lower():
            result['material'] = material
            break
    
    # Category extraction
    categories = ['sofa', 'couch', 'chair', 'table', 'lamp', 'rug', 'bed', 'desk', 'shelf']
    for cat in categories:
        if cat in query.lower():
            result['category'] = cat
            break
    
    result['text'] = query.strip()
    return result

# Example:
# parse_search_query("blue velvet sofa under $1000")
# → {'text': 'sofa', 'category': 'sofa', 'style': None, 'color': 'blue', 
#    'material': 'velvet', 'max_price': 1000, 'min_price': None}
```

---

## 🎛️ STREAM 5: ORCHESTRATOR

### Goal: Coordinate all streams, manage API, caching

### Components:
```
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR RESPONSIBILITIES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. API GATEWAY                                              │
│     • Rate limiting per endpoint                            │
│     • Request validation                                     │
│     • Error handling                                         │
│                                                              │
│  2. CACHING LAYER                                            │
│     • Redis for search results (TTL: 1 hour)                │
│     • MongoDB for product catalog                           │
│     • In-memory for hot queries                             │
│                                                              │
│  3. BACKGROUND JOBS                                          │
│     • Product feed sync (every 6 hours)                     │
│     • AI enrichment queue                                    │
│     • CLIP embedding updates                                 │
│                                                              │
│  4. MONITORING                                               │
│     • Search latency tracking                               │
│     • Zero-result query logging                             │
│     • Click-through rate tracking                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 EXECUTION TIMELINE

### Week 1: Foundation
| Day | Stream 1 | Stream 2 | Stream 3 | Stream 4 | Stream 5 |
|-----|----------|----------|----------|----------|----------|
| 1-2 | Wayfair affiliate signup | LLM style detection | CLIP setup | Query parser | MongoDB schema |
| 3-4 | Amazon Associates signup | Category detection | Embedding pipeline | Ranking algo | Caching layer |
| 5-7 | Feed import scripts | Price extraction | Vector index | Suggestions | Background jobs |

### Week 2: Integration
| Day | Focus |
|-----|-------|
| 8-9 | Connect all data sources to unified API |
| 10-11 | Deploy visual search endpoint |
| 12-13 | UI updates (visual search, filters) |
| 14 | Testing + Performance tuning |

---

## 🎯 SUCCESS METRICS

| Metric | Current | Week 1 Target | Week 2 Target |
|--------|---------|---------------|---------------|
| Products in DB | 140 | 500 | 2,000+ |
| Products with images | 80% | 90% | 95% |
| Products with prices | 60% | 80% | 90% |
| Products with style | 20% | 100% | 100% |
| Avg search latency | 3s | 2s | 1s |
| Visual search | ❌ | ❌ | ✅ |

---

## 🔧 IMMEDIATE NEXT ACTIONS

```
PRIORITY 1 (DO NOW):
[ ] Set up MongoDB collections: products, searches, clicks
[ ] Add query parser to /api/products/discover
[ ] Implement LLM style detection using Gemini Flash

PRIORITY 2 (THIS WEEK):
[ ] Sign up for Wayfair affiliate (CJ Affiliate)
[ ] Sign up for Amazon Associates
[ ] Create bulk import script for Google Sheets

PRIORITY 3 (NEXT WEEK):
[ ] CLIP embedding pipeline
[ ] Visual search endpoint
[ ] Frontend image upload
```

---

## 💡 KEY INSIGHT

**The moat isn't the data — it's the curation quality.**

Anyone can scrape Wayfair. The value is:
1. **AI-powered style matching** (not just keyword search)
2. **Cross-store price comparison** (same product, best price)
3. **Visual search** (upload inspiration, find products)
4. **Human curation** (the "editor's picks" feel)

Build for taste, not just quantity.
