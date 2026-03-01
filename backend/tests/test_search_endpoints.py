"""
Test cases for Lumina Search Aggregator API endpoints
NEW FEATURE: Live Product Search using DuckDuckGo API

Tests:
- /api/search/products - Product search across multiple retailers
- /api/search/images - Product image search
- /api/search/suggestions - Autocomplete suggestions
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSearchProducts:
    """Tests for /api/search/products endpoint"""
    
    def test_search_products_basic_query(self):
        """Test basic product search with a simple query"""
        response = requests.get(
            f"{BASE_URL}/api/search/products",
            params={"q": "velvet sofa"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("ok") == True, f"Search failed: {data}"
        assert "products" in data, "Response missing 'products' field"
        assert "total" in data, "Response missing 'total' field"
        assert "query" in data, "Response missing 'query' field"
        assert data["query"] == "velvet sofa"
        
        # Verify product structure if results exist
        if len(data["products"]) > 0:
            product = data["products"][0]
            assert "id" in product
            assert "name" in product
            assert "url" in product
            assert "store" in product
            assert "category" in product
            assert "style" in product
            print(f"Found {data['total']} products, first: {product['name'][:50]}...")

    def test_search_products_with_max_results(self):
        """Test product search with custom max_results parameter"""
        response = requests.get(
            f"{BASE_URL}/api/search/products",
            params={"q": "dining table", "max_results": 10}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("ok") == True
        assert len(data["products"]) <= 10, "Should respect max_results limit"
        print(f"Requested 10, got {len(data['products'])} products")

    def test_search_products_with_category_filter(self):
        """Test product search with category filter"""
        response = requests.get(
            f"{BASE_URL}/api/search/products",
            params={"q": "modern furniture", "category": "chair"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("ok") == True
        # Results should be filtered by category (or empty if no matches)
        for product in data["products"]:
            assert product["category"] == "chair", f"Category filter not applied: {product['category']}"
        print(f"Category filter working: {len(data['products'])} chair products")

    def test_search_products_with_style_filter(self):
        """Test product search with style filter"""
        response = requests.get(
            f"{BASE_URL}/api/search/products",
            params={"q": "sofa", "style": "modern"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("ok") == True
        for product in data["products"]:
            assert product["style"] == "modern", f"Style filter not applied: {product['style']}"
        print(f"Style filter working: {len(data['products'])} modern products")

    def test_search_products_with_price_filter(self):
        """Test product search with price range filters"""
        response = requests.get(
            f"{BASE_URL}/api/search/products",
            params={"q": "lamp", "min_price": 50, "max_price": 200}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("ok") == True
        # Products with prices should be within range
        for product in data["products"]:
            if product.get("price"):
                assert 50 <= product["price"] <= 200, f"Price filter not applied: ${product['price']}"
        print(f"Price filter applied: {len(data['products'])} products in $50-$200 range")

    def test_search_products_empty_query(self):
        """Test empty query handling - API may return results or validation error"""
        response = requests.get(
            f"{BASE_URL}/api/search/products",
            params={"q": ""}
        )
        # DuckDuckGo may handle empty query by returning general results
        # Either validation error (422) or valid response (200) is acceptable
        assert response.status_code in [200, 400, 422], f"Unexpected status: {response.status_code}"
        print(f"Empty query returned status {response.status_code}")


class TestSearchImages:
    """Tests for /api/search/images endpoint"""
    
    def test_search_images_basic_query(self):
        """Test basic image search"""
        response = requests.get(
            f"{BASE_URL}/api/search/images",
            params={"q": "mid century chair"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("ok") == True, f"Image search failed: {data}"
        assert "images" in data
        assert "total" in data
        
        if len(data["images"]) > 0:
            image = data["images"][0]
            assert "id" in image
            assert "url" in image
            assert "thumbnail" in image
            assert "title" in image
            assert "source" in image
            assert "source_url" in image
            print(f"Found {data['total']} images, first from: {image['source']}")

    def test_search_images_with_max_results(self):
        """Test image search with max_results parameter"""
        response = requests.get(
            f"{BASE_URL}/api/search/images",
            params={"q": "modern sofa furniture", "max_results": 8}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Image search may return ok=False with empty results due to DuckDuckGo variability
        # We just check the response structure is correct
        assert "images" in data
        assert "total" in data
        if data.get("ok"):
            assert len(data["images"]) <= 8, "Should respect max_results limit"
        print(f"Requested 8 images, got {len(data.get('images', []))}")


class TestSearchSuggestions:
    """Tests for /api/search/suggestions endpoint"""
    
    def test_suggestions_basic_query(self):
        """Test basic autocomplete suggestions"""
        response = requests.get(
            f"{BASE_URL}/api/search/suggestions",
            params={"q": "mod"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("ok") == True
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)
        print(f"Got {len(data['suggestions'])} suggestions for 'mod': {data['suggestions'][:3]}")

    def test_suggestions_short_query_fails(self):
        """Test that query shorter than 2 chars fails validation"""
        response = requests.get(
            f"{BASE_URL}/api/search/suggestions",
            params={"q": "m"}
        )
        # Should fail validation (422) since min_length=2
        assert response.status_code == 422, f"Expected 422 for short query, got {response.status_code}"


class TestExistingEndpoints:
    """Verify existing monetization endpoints still work (regression)"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_affiliate_click_tracking(self):
        """Test affiliate click tracking (from search results)"""
        payload = {
            "product_id": "TEST_search_product_123",
            "product_name": "Test Velvet Sofa from Search",
            "store": "Amazon",
            "price": 899.99,
            "destination_url": "https://amazon.com/test-sofa"
        }
        response = requests.post(f"{BASE_URL}/api/affiliate-click", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["ok"] == True
        assert "event_id" in data
        print(f"Affiliate click tracked: {data['event_id']}")

    def test_monetization_metrics(self):
        """Test monetization metrics endpoint"""
        response = requests.get(f"{BASE_URL}/api/monetization/metrics")
        assert response.status_code == 200
        
        data = response.json()
        assert "affiliate_clicks" in data
        assert "consultation_leads" in data
        assert "contact_leads" in data
        print(f"Metrics: {data['affiliate_clicks']} clicks, {data['consultation_leads']} consultations")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
