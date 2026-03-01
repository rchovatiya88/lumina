from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional
import asyncio
import hashlib
import re

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from duckduckgo_search import DDGS


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
