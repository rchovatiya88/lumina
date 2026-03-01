from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
import asyncio
import hashlib
import re
import json
import os
from io import StringIO

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ddgs import DDGS
import requests


app = FastAPI(title="Lumina Backend", version="1.0.0")

# Simple in-memory cache for search results
search_cache: dict[str, dict] = {}
curated_products_cache: dict[str, any] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour
CURATED_CACHE_TTL = 300  # 5 minutes for curated products

# Google Sheets URL for curated products (public sheet)
GOOGLE_SHEET_URL = os.environ.get("GOOGLE_SHEET_URL", "")

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



# ============== CURATED PRODUCTS (Google Sheets + JSON) ==============

def parse_concatenated_products(text: str) -> list[dict]:
    """
    Parse products that were accidentally pasted into a single cell.
    Handles format: "Product1,price,url,... Product2,price,url,..."
    """
    import re
    products = []
    
    # Remove quotes and clean up
    text = text.replace('"', '').strip()
    
    print(f"parse_concatenated_products input length: {len(text)}")
    print(f"First 100 chars: {text[:100]}")
    
    # Skip if it looks like just headers
    if text.startswith('name,price') and len(text) < 100:
        print("Skipping - looks like just headers")
        return products
    
    # Pattern: name,price,image_url,store,category,style,affiliate_url
    # Name must start with capital letter and not be a header word
    product_pattern = r'([A-Z][A-Za-z\s\-]+),(\d+),(https?://[^,]+),([^,]+),([^,]+),([^,]+),(https?://[^\s]+)'
    matches = re.findall(product_pattern, text)
    
    print(f"Regex found {len(matches)} matches")
    
    for match in matches:
        name, price, image, store, category, style, affiliate = match
        
        # Skip if this looks like header data
        if 'affiliate_link' in name.lower() or 'price' in name.lower():
            continue
            
        try:
            price_val = float(price)
        except:
            price_val = 0
        
        print(f"Adding product: {name[:30]} | ${price_val} | {store}")
            
        products.append({
            "id": f"sheet-{hashlib.md5(name.encode()).hexdigest()[:8]}",
            "name": name.strip(),
            "price": price_val,
            "image": image.strip(),
            "store": store.strip(),
            "category": category.strip().lower(),
            "style": style.strip().lower(),
            "affiliate_link": affiliate.strip(),
            "buyUrl": affiliate.strip(),
            "source": "curated",
        })
    
    return products


def fetch_google_sheet_products() -> list[dict]:
    """
    Fetch products from a public Google Sheet.
    Sheet should have columns: name, price, image, store, category, style, affiliate_link
    Handles both proper CSV format and concatenated single-cell data.
    """
    if not GOOGLE_SHEET_URL:
        return []
    
    try:
        # Extract sheet ID from URL
        if "/spreadsheets/d/" in GOOGLE_SHEET_URL:
            sheet_id = GOOGLE_SHEET_URL.split("/spreadsheets/d/")[1].split("/")[0]
        else:
            sheet_id = GOOGLE_SHEET_URL
        
        # Build CSV export URL
        csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(csv_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        raw_text = response.text
        print(f"Raw sheet data length: {len(raw_text)}")
        
        # First, check if the entire text contains concatenated data
        # This happens when all products are pasted into one cell
        if raw_text.count('https://') > 4:  # Multiple URLs suggest concatenated data
            print("Detected potential concatenated data in sheet, attempting to parse...")
            concat_products = parse_concatenated_products(raw_text)
            if concat_products:
                print(f"Successfully parsed {len(concat_products)} concatenated products")
                return concat_products
        
        # Parse CSV normally
        import csv
        reader = csv.DictReader(StringIO(raw_text))
        products = []
        
        for row in reader:
            # Get the first column value (might be 'name' or concatenated data)
            name_value = row.get('name', '')
            
            # Check if this looks like concatenated data (contains multiple URLs)
            if name_value and name_value.count('https://') > 1:
                # This is concatenated data - parse it specially
                print(f"Detected concatenated data in row, parsing...")
                concat_products = parse_concatenated_products(name_value)
                products.extend(concat_products)
                continue
            
            # Normal row processing
            if not name_value:
                continue
            
            try:
                price = float(row.get('price', 0) or 0)
            except (ValueError, TypeError):
                price = 0
            
            products.append({
                "id": f"sheet-{hashlib.md5(name_value.encode()).hexdigest()[:8]}",
                "name": name_value,
                "price": price,
                "image": row.get('image', ''),
                "store": row.get('store', 'Curated'),
                "category": row.get('category', 'decor').lower(),
                "style": row.get('style', 'modern').lower(),
                "affiliate_link": row.get('affiliate_link', ''),
                "buyUrl": row.get('affiliate_link', '') or row.get('buyUrl', ''),
                "source": "curated",  # Mark as curated
            })
        
        print(f"Parsed {len(products)} products from sheet")
        return products
    except Exception as e:
        print(f"Error fetching Google Sheet: {e}")
        import traceback
        traceback.print_exc()
        return []


def load_json_products() -> list[dict]:
    """Load products from the local JSON file."""
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'imported_products.json')
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                products = json.load(f)
                # Mark as curated
                for p in products:
                    p['source'] = 'curated'
                return products
    except Exception as e:
        print(f"Error loading JSON products: {e}")
    return []


def get_all_curated_products() -> list[dict]:
    """
    Get all curated products from both Google Sheets and JSON file.
    Results are cached for 5 minutes.
    """
    cache_key = "all_curated"
    
    # Check cache
    if cache_key in curated_products_cache:
        cached = curated_products_cache[cache_key]
        if (datetime.now(timezone.utc).timestamp() - cached.get("cached_at", 0)) < CURATED_CACHE_TTL:
            return cached["products"]
    
    # Fetch from both sources
    sheet_products = fetch_google_sheet_products()
    json_products = load_json_products()
    
    # Combine and dedupe (prefer sheet products if same name)
    seen_names = set()
    all_products = []
    
    # Sheet products first (higher priority)
    for p in sheet_products:
        name_key = p.get('name', '').lower()[:50]
        if name_key and name_key not in seen_names:
            seen_names.add(name_key)
            all_products.append(p)
    
    # Then JSON products
    for p in json_products:
        name_key = p.get('name', '').lower()[:50]
        if name_key and name_key not in seen_names:
            seen_names.add(name_key)
            all_products.append(p)
    
    # Cache results
    curated_products_cache[cache_key] = {
        "products": all_products,
        "cached_at": datetime.now(timezone.utc).timestamp(),
    }
    
    return all_products


@app.get("/api/products/curated")
def get_curated_products(
    category: Optional[str] = Query(None),
    style: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
):
    """
    Get curated products from Google Sheets and local JSON.
    These are hand-picked products with verified images and affiliate links.
    """
    products = get_all_curated_products()
    
    # Apply filters
    filtered = products
    
    if search:
        search_lower = search.lower()
        filtered = [p for p in filtered if search_lower in p.get('name', '').lower() 
                   or search_lower in p.get('category', '').lower()
                   or search_lower in p.get('style', '').lower()]
    
    if category and category != 'all':
        filtered = [p for p in filtered if p.get('category', '').lower() == category.lower()]
    
    if style and style != 'all':
        filtered = [p for p in filtered if p.get('style', '').lower() == style.lower()]
    
    if min_price is not None:
        filtered = [p for p in filtered if (p.get('price') or 0) >= min_price]
    
    if max_price is not None:
        filtered = [p for p in filtered if (p.get('price') or 0) <= max_price]
    
    return {
        "ok": True,
        "total": len(filtered),
        "products": filtered[:limit],
        "source": "curated",
    }


@app.get("/api/products/discover")
def discover_products(
    q: str = Query("", description="Search query"),
    category: Optional[str] = Query(None),
    style: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    max_results: int = Query(30, ge=5, le=100),
):
    """
    UNIFIED DISCOVERY: Combines curated products + live web search.
    Curated products appear first, web results fill the rest.
    """
    # Step 1: Search curated products first
    curated = get_all_curated_products()
    curated_matches = []
    
    if q:
        q_lower = q.lower()
        curated_matches = [p for p in curated if 
                          q_lower in p.get('name', '').lower() or
                          q_lower in p.get('category', '').lower() or
                          q_lower in p.get('style', '').lower() or
                          q_lower in p.get('store', '').lower()]
    else:
        curated_matches = curated
    
    # Apply filters to curated
    if category and category != 'all':
        curated_matches = [p for p in curated_matches if p.get('category', '').lower() == category.lower()]
    
    if style and style != 'all':
        curated_matches = [p for p in curated_matches if p.get('style', '').lower() == style.lower()]
    
    if min_price is not None:
        curated_matches = [p for p in curated_matches if (p.get('price') or 0) >= min_price]
    
    if max_price is not None:
        curated_matches = [p for p in curated_matches if (p.get('price') or 0) <= max_price]
    
    # Limit curated results
    curated_results = curated_matches[:min(15, max_results // 2)]
    
    # Step 2: If we need more results, search the web
    web_results = []
    remaining_slots = max_results - len(curated_results)
    
    if remaining_slots > 0 and q:
        # Use the existing search functionality
        search_query = f"{q} furniture buy online"
        cache_key = hashlib.md5(f"{search_query}:{remaining_slots}".encode()).hexdigest()
        
        if cache_key in search_cache and (datetime.now(timezone.utc).timestamp() - search_cache[cache_key].get("cached_at", 0)) < CACHE_TTL_SECONDS:
            web_results = search_cache[cache_key]["results"][:remaining_slots]
        else:
            try:
                with DDGS() as ddgs:
                    raw_results = list(ddgs.text(
                        search_query,
                        max_results=remaining_slots * 2,
                        region="us-en",
                    ))
                
                seen_titles = {p.get('name', '').lower()[:50] for p in curated_results}
                
                for item in raw_results:
                    title = item.get("title", "")
                    url = item.get("href", "")
                    body = item.get("body", "")
                    
                    title_key = title.lower()[:50]
                    if title_key in seen_titles:
                        continue
                    seen_titles.add(title_key)
                    
                    store = detect_store(url)
                    price = extract_price(title) or extract_price(body)
                    full_text = f"{title} {body}"
                    
                    web_results.append({
                        "id": hashlib.md5(url.encode()).hexdigest()[:12],
                        "name": title[:100],
                        "description": body[:200] if body else "",
                        "price": price,
                        "url": url,
                        "buyUrl": url,
                        "store": store,
                        "category": detect_category(full_text),
                        "style": detect_style(full_text),
                        "image": None,
                        "source": "web",  # Mark as web result
                    })
                    
                    if len(web_results) >= remaining_slots:
                        break
                
                search_cache[cache_key] = {
                    "results": web_results,
                    "cached_at": datetime.now(timezone.utc).timestamp(),
                }
            except Exception as e:
                print(f"Web search error: {e}")
    
    return {
        "ok": True,
        "query": q,
        "curated_count": len(curated_results),
        "web_count": len(web_results),
        "total": len(curated_results) + len(web_results),
        "products": curated_results + web_results,
    }


@app.post("/api/products/sheets/configure")
def configure_sheets_url(url: str = Query(..., description="Public Google Sheets URL")):
    """
    Configure the Google Sheets URL for curated products.
    Note: This is temporary - URL should be set via environment variable in production.
    """
    global GOOGLE_SHEET_URL
    GOOGLE_SHEET_URL = url
    
    # Clear cache to force refresh
    curated_products_cache.clear()
    
    # Test the connection
    products = fetch_google_sheet_products()
    
    return {
        "ok": True,
        "message": f"Configured Google Sheets. Found {len(products)} products.",
        "sample": products[:3] if products else [],
    }
