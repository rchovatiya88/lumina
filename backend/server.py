from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
import asyncio
import hashlib
import re

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ddgs import DDGS


app = FastAPI(title="Lumina Backend", version="1.0.0")

# Simple in-memory cache for search results
search_cache: dict[str, dict] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AffiliateClickIn(BaseModel):
    product_id: str
    product_name: str
    store: str
    price: float = 0
    destination_url: str


class ConsultationLeadIn(BaseModel):
    name: str
    email: str
    project_type: str
    budget: str
    message: str


class ContactLeadIn(BaseModel):
    name: str
    email: str
    subject: str
    message: str


affiliate_clicks: list[dict] = []
consultation_leads: list[dict] = []
contact_leads: list[dict] = []


@app.get("/")
def root():
    return {"status": "ok", "service": "lumina-backend"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.post("/api/affiliate-click")
def track_affiliate_click(payload: AffiliateClickIn):
    event = {
        "id": str(uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        **payload.model_dump(),
    }
    affiliate_clicks.append(event)
    if len(affiliate_clicks) > 1000:
        affiliate_clicks.pop(0)
    return {"ok": True, "event_id": event["id"]}


@app.post("/api/leads/consultation")
def create_consultation_lead(payload: ConsultationLeadIn):
    lead = {
        "id": str(uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        **payload.model_dump(),
    }
    consultation_leads.append(lead)
    if len(consultation_leads) > 1000:
        consultation_leads.pop(0)
    return {"ok": True, "lead_id": lead["id"]}


@app.post("/api/leads/contact")
def create_contact_lead(payload: ContactLeadIn):
    lead = {
        "id": str(uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        **payload.model_dump(),
    }
    contact_leads.append(lead)
    if len(contact_leads) > 1000:
        contact_leads.pop(0)
    return {"ok": True, "lead_id": lead["id"]}


@app.get("/api/monetization/metrics")
def get_monetization_metrics():
    store_clicks: dict[str, int] = {}
    for click in affiliate_clicks:
        store = click["store"]
        store_clicks[store] = store_clicks.get(store, 0) + 1

    top_stores = [
        {"store": store, "clicks": clicks}
        for store, clicks in sorted(store_clicks.items(), key=lambda item: item[1], reverse=True)
    ]

    return {
        "affiliate_clicks": len(affiliate_clicks),
        "consultation_leads": len(consultation_leads),
        "contact_leads": len(contact_leads),
        "estimated_affiliate_revenue": round(len(affiliate_clicks) * 1.8, 2),
        "top_stores": top_stores,
    }


# ============== PRODUCT SEARCH AGGREGATOR ==============

FURNITURE_SITES = [
    "amazon.com",
    "wayfair.com", 
    "westelm.com",
    "cb2.com",
    "ikea.com",
    "target.com",
    "overstock.com",
    "allmodern.com",
    "article.com",
    "potterybarn.com",
]

FURNITURE_CATEGORIES = {
    "sofa": ["sofa", "couch", "sectional", "loveseat"],
    "chair": ["chair", "armchair", "accent chair", "dining chair", "office chair"],
    "table": ["table", "coffee table", "dining table", "side table", "console"],
    "bed": ["bed", "bedframe", "headboard", "platform bed"],
    "lamp": ["lamp", "lighting", "floor lamp", "table lamp", "chandelier", "pendant"],
    "rug": ["rug", "carpet", "area rug", "runner"],
    "storage": ["shelf", "bookshelf", "cabinet", "dresser", "nightstand"],
    "decor": ["decor", "vase", "mirror", "art", "pillow", "throw"],
}

STYLE_KEYWORDS = {
    "modern": ["modern", "contemporary", "minimalist", "sleek"],
    "boho": ["boho", "bohemian", "eclectic", "macrame"],
    "industrial": ["industrial", "metal", "rustic", "raw"],
    "mid-century": ["mid-century", "mcm", "retro", "vintage"],
    "scandinavian": ["scandinavian", "scandi", "nordic", "hygge"],
    "farmhouse": ["farmhouse", "rustic", "country", "barn"],
    "glam": ["glam", "glamorous", "luxe", "velvet", "gold"],
    "coastal": ["coastal", "beach", "nautical", "seaside"],
}


def extract_price(text: str) -> Optional[float]:
    """Extract price from text like '$299.99' or '299'"""
    if not text:
        return None
    # Look for price patterns
    patterns = [
        r'\$[\d,]+\.?\d*',  # $299.99 or $1,299
        r'[\d,]+\.?\d*\s*(?:USD|dollars?)',  # 299 USD
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price_str = re.sub(r'[^\d.]', '', match.group())
            try:
                return float(price_str)
            except ValueError:
                continue
    return None


def detect_store(url: str) -> str:
    """Detect store name from URL"""
    url_lower = url.lower()
    store_map = {
        "amazon": "Amazon",
        "wayfair": "Wayfair",
        "westelm": "West Elm",
        "cb2": "CB2",
        "ikea": "IKEA",
        "target": "Target",
        "overstock": "Overstock",
        "allmodern": "AllModern",
        "article": "Article",
        "potterybarn": "Pottery Barn",
        "homedepot": "Home Depot",
        "lowes": "Lowe's",
        "etsy": "Etsy",
        "anthropologie": "Anthropologie",
        "worldmarket": "World Market",
    }
    for key, name in store_map.items():
        if key in url_lower:
            return name
    return "Other"


def detect_category(text: str) -> str:
    """Detect furniture category from text"""
    text_lower = text.lower()
    for category, keywords in FURNITURE_CATEGORIES.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category
    return "decor"


def detect_style(text: str) -> str:
    """Detect furniture style from text"""
    text_lower = text.lower()
    for style, keywords in STYLE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return style
    return "modern"


def get_cache_key(query: str, max_results: int) -> str:
    """Generate cache key for search query"""
    return hashlib.md5(f"{query.lower().strip()}:{max_results}".encode()).hexdigest()


def is_cache_valid(cache_entry: dict) -> bool:
    """Check if cache entry is still valid"""
    if not cache_entry:
        return False
    cached_at = cache_entry.get("cached_at", 0)
    return (datetime.now(timezone.utc).timestamp() - cached_at) < CACHE_TTL_SECONDS


@app.get("/api/search/products")
def search_products(
    q: str = Query(..., description="Search query like 'modern velvet sofa'"),
    max_results: int = Query(20, ge=5, le=50),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    style: Optional[str] = Query(None, description="Filter by style"),
):
    """
    Search for furniture products across multiple retailers using DuckDuckGo.
    Returns aggregated results with price, store, category, and style detection.
    """
    # Build search query focused on furniture/home
    search_query = f"{q} furniture buy online"
    
    # Check cache first
    cache_key = get_cache_key(search_query, max_results)
    if cache_key in search_cache and is_cache_valid(search_cache[cache_key]):
        results = search_cache[cache_key]["results"]
    else:
        # Search using DuckDuckGo
        try:
            with DDGS() as ddgs:
                raw_results = list(ddgs.text(
                    search_query,
                    max_results=max_results * 2,  # Get extra to filter
                    region="us-en",
                ))
        except Exception as e:
            return {"ok": False, "error": str(e), "products": []}
        
        # Process and enrich results
        results = []
        seen_titles = set()
        
        for item in raw_results:
            title = item.get("title", "")
            url = item.get("href", "")
            body = item.get("body", "")
            
            # Skip duplicates
            title_key = title.lower()[:50]
            if title_key in seen_titles:
                continue
            seen_titles.add(title_key)
            
            # Detect store from URL
            store = detect_store(url)
            
            # Extract price from title or body
            price = extract_price(title) or extract_price(body)
            
            # Detect category and style
            full_text = f"{title} {body}"
            detected_category = detect_category(full_text)
            detected_style = detect_style(full_text)
            
            # Generate a stable product ID
            product_id = hashlib.md5(url.encode()).hexdigest()[:12]
            
            results.append({
                "id": product_id,
                "name": title[:100],  # Truncate long titles
                "description": body[:200] if body else "",
                "price": price,
                "url": url,
                "store": store,
                "category": detected_category,
                "style": detected_style,
                "image": None,  # Will be populated by image search
            })
        
        # Cache results
        search_cache[cache_key] = {
            "results": results,
            "cached_at": datetime.now(timezone.utc).timestamp(),
        }
        
        # Clean old cache entries (keep last 100)
        if len(search_cache) > 100:
            oldest_keys = sorted(
                search_cache.keys(),
                key=lambda k: search_cache[k].get("cached_at", 0)
            )[:50]
            for key in oldest_keys:
                del search_cache[key]
    
    # Apply filters
    filtered = results
    
    if category:
        filtered = [p for p in filtered if p["category"] == category.lower()]
    
    if style:
        filtered = [p for p in filtered if p["style"] == style.lower()]
    
    if min_price is not None:
        filtered = [p for p in filtered if p["price"] and p["price"] >= min_price]
    
    if max_price is not None:
        filtered = [p for p in filtered if p["price"] and p["price"] <= max_price]
    
    return {
        "ok": True,
        "query": q,
        "total": len(filtered),
        "products": filtered[:max_results],
    }


@app.get("/api/search/images")
def search_product_images(
    q: str = Query(..., description="Product search query"),
    max_results: int = Query(12, ge=1, le=30),
):
    """
    Search for product images using DuckDuckGo image search.
    Better for visual discovery.
    """
    search_query = f"{q} furniture product photo"
    
    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.images(
                search_query,
                max_results=max_results,
                region="us-en",
                safesearch="moderate",
            ))
    except Exception as e:
        return {"ok": False, "error": str(e), "images": []}
    
    images = []
    for item in raw_results:
        images.append({
            "id": hashlib.md5(item.get("image", "").encode()).hexdigest()[:12],
            "url": item.get("image"),
            "thumbnail": item.get("thumbnail"),
            "title": item.get("title", ""),
            "source": item.get("source", ""),
            "source_url": item.get("url", ""),
        })
    
    return {
        "ok": True,
        "query": q,
        "total": len(images),
        "images": images,
    }


@app.get("/api/search/suggestions")
def get_search_suggestions(
    q: str = Query(..., min_length=2, description="Partial search query"),
):
    """
    Get search suggestions for autocomplete.
    """
    try:
        with DDGS() as ddgs:
            suggestions = list(ddgs.suggestions(f"{q} furniture"))
    except Exception:
        suggestions = []
    
    # Filter and enhance suggestions
    furniture_suggestions = [
        s.get("phrase", s) if isinstance(s, dict) else s
        for s in suggestions[:8]
    ]
    
    return {
        "ok": True,
        "suggestions": furniture_suggestions,
    }
