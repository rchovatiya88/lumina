import os
import uuid

import pytest
import requests

# Monetization and lead capture API coverage for Lumina MVP flows
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if BASE_URL:
    BASE_URL = BASE_URL.rstrip("/")
else:
    BASE_URL = "http://127.0.0.1:8001"


@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


def test_health_endpoint(api_client):
    response = api_client.get(f"{BASE_URL}/api/health", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"


def test_affiliate_click_tracking_and_metrics_increment(api_client):
    before = api_client.get(f"{BASE_URL}/api/monetization/metrics", timeout=10)
    assert before.status_code == 200
    before_data = before.json()

    payload = {
        "product_id": f"TEST_{uuid.uuid4().hex[:8]}",
        "product_name": "TEST Accent Chair",
        "store": "TEST_STORE",
        "price": 129.99,
        "destination_url": "https://example.com/product/test-chair",
    }
    track_response = api_client.post(f"{BASE_URL}/api/affiliate-click", json=payload, timeout=10)
    assert track_response.status_code == 200
    tracked = track_response.json()
    assert tracked.get("ok") is True
    assert isinstance(tracked.get("event_id"), str) and len(tracked["event_id"]) > 0

    after = api_client.get(f"{BASE_URL}/api/monetization/metrics", timeout=10)
    assert after.status_code == 200
    after_data = after.json()

    assert after_data["affiliate_clicks"] == before_data["affiliate_clicks"] + 1
    assert isinstance(after_data.get("estimated_affiliate_revenue"), (float, int))
    assert any(store.get("store") == "TEST_STORE" for store in after_data.get("top_stores", []))


def test_consultation_lead_submit_and_metrics_increment(api_client):
    before = api_client.get(f"{BASE_URL}/api/monetization/metrics", timeout=10)
    assert before.status_code == 200
    before_data = before.json()

    payload = {
        "name": "TEST User",
        "email": f"test_consult_{uuid.uuid4().hex[:6]}@example.com",
        "project_type": "Living Room",
        "budget": "Under $1,000",
        "message": "TEST consultation request",
    }
    response = api_client.post(f"{BASE_URL}/api/leads/consultation", json=payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data.get("ok") is True
    assert isinstance(data.get("lead_id"), str) and len(data["lead_id"]) > 0

    after = api_client.get(f"{BASE_URL}/api/monetization/metrics", timeout=10)
    assert after.status_code == 200
    after_data = after.json()
    assert after_data["consultation_leads"] == before_data["consultation_leads"] + 1


def test_contact_lead_submit_and_metrics_increment(api_client):
    before = api_client.get(f"{BASE_URL}/api/monetization/metrics", timeout=10)
    assert before.status_code == 200
    before_data = before.json()

    payload = {
        "name": "TEST Contact",
        "email": f"test_contact_{uuid.uuid4().hex[:6]}@example.com",
        "subject": "TEST Subject",
        "message": "TEST contact message",
    }
    response = api_client.post(f"{BASE_URL}/api/leads/contact", json=payload, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data.get("ok") is True
    assert isinstance(data.get("lead_id"), str) and len(data["lead_id"]) > 0

    after = api_client.get(f"{BASE_URL}/api/monetization/metrics", timeout=10)
    assert after.status_code == 200
    after_data = after.json()
    assert after_data["contact_leads"] == before_data["contact_leads"] + 1
