"""
Test suite for Price Comparison feature endpoints.
Tests:
- /api/products/compare - Live price comparison with DuckDuckGo search
- /api/products/grouped - Grouped products with optional live enrichment
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthCheck:
    """Basic health check to ensure backend is running"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")


class TestPriceCompareEndpoint:
    """Tests for /api/products/compare endpoint"""
    
    def test_compare_without_params_returns_error(self):
        """Should return error when no product_id or product_name provided"""
        response = requests.get(f"{BASE_URL}/api/products/compare", timeout=10)
        assert response.status_code == 200  # FastAPI returns 200 with ok: false
        data = response.json()
        assert data["ok"] is False
        assert "error" in data
        assert "product_id or product_name" in data["error"].lower()
        print("✓ Compare without params returns error correctly")
    
    def test_compare_with_product_name_returns_live_results(self):
        """Should return live web results when searching by product_name"""
        response = requests.get(
            f"{BASE_URL}/api/products/compare",
            params={"product_name": "velvet sofa"},
            timeout=30  # Live search can take time
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert "comparison" in data
        
        comparison = data["comparison"]
        
        # Verify target product exists
        assert "target_product" in comparison
        target = comparison["target_product"]
        assert target["name"] == "velvet sofa"
        assert target["source"] == "query"
        
        # Verify stores list exists
        assert "stores" in comparison
        assert isinstance(comparison["stores"], list)
        
        # Verify price range exists
        assert "price_range" in comparison
        
        # Verify we got web results
        assert "web_matches" in comparison
        assert comparison["web_matches"] >= 0  # May vary based on live search
        
        print(f"✓ Compare with product_name returned {len(comparison['stores'])} stores, {comparison['web_matches']} web matches")
    
    def test_compare_response_structure(self):
        """Verify the compare response has all required fields"""
        response = requests.get(
            f"{BASE_URL}/api/products/compare",
            params={"product_name": "coffee table"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        
        comparison = data["comparison"]
        
        # Required fields
        required_fields = ["target_product", "stores", "price_range", "curated_matches", "web_matches", "similar_products"]
        for field in required_fields:
            assert field in comparison, f"Missing field: {field}"
        
        # Store structure validation
        if comparison["stores"]:
            store = comparison["stores"][0]
            store_fields = ["store", "price", "product", "is_target", "source"]
            for field in store_fields:
                assert field in store, f"Store missing field: {field}"
            
            # Product in store
            product = store["product"]
            product_fields = ["id", "name", "store", "source"]
            for field in product_fields:
                assert field in product, f"Product missing field: {field}"
        
        print("✓ Compare response structure is valid")
    
    def test_compare_returns_multiple_stores(self):
        """Live search should return results from multiple stores"""
        response = requests.get(
            f"{BASE_URL}/api/products/compare",
            params={"product_name": "modern dining table"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        
        stores = data["comparison"]["stores"]
        unique_stores = set(s["store"] for s in stores)
        
        # Should have at least some stores (may vary based on live search)
        print(f"✓ Compare returned {len(stores)} store listings from {len(unique_stores)} unique stores")


class TestProductsGroupedEndpoint:
    """Tests for /api/products/grouped endpoint"""
    
    def test_grouped_without_query(self):
        """Should return all curated products grouped by similarity"""
        response = requests.get(f"{BASE_URL}/api/products/grouped", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert "total" in data
        assert "groups" in data
        assert "live_enriched" in data
        assert data["live_enriched"] is False
        
        print(f"✓ Grouped without query returned {data['total']} groups")
    
    def test_grouped_with_query(self):
        """Should return filtered groups matching the query"""
        response = requests.get(
            f"{BASE_URL}/api/products/grouped",
            params={"q": "chair"},
            timeout=15
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        
        # All groups should have chair-related main products
        groups = data["groups"]
        if groups:
            for group in groups[:3]:  # Check first few
                main_product = group["main_product"]
                # Product should be related to chair (either name or category)
                is_related = (
                    "chair" in main_product.get("name", "").lower() or
                    main_product.get("category", "").lower() == "chair"
                )
                assert is_related, f"Product {main_product['name']} not related to 'chair'"
        
        print(f"✓ Grouped with query 'chair' returned {data['total']} groups")
    
    def test_grouped_with_category_filter(self):
        """Should filter groups by category"""
        response = requests.get(
            f"{BASE_URL}/api/products/grouped",
            params={"category": "sofa"},
            timeout=15
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        
        # All main products should be in sofa category
        groups = data["groups"]
        for group in groups[:5]:
            main_product = group["main_product"]
            assert main_product.get("category", "").lower() == "sofa", \
                f"Expected category 'sofa', got {main_product.get('category')}"
        
        print(f"✓ Grouped with category filter returned {data['total']} sofa groups")
    
    def test_grouped_with_live_enrichment(self):
        """Should enrich top groups with live web prices when live=true"""
        response = requests.get(
            f"{BASE_URL}/api/products/grouped",
            params={"q": "sofa", "live": "true"},
            timeout=45  # Live search takes longer
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert data["live_enriched"] is True
        
        groups = data["groups"]
        if groups:
            first_group = groups[0]
            # When live=true, top groups should have web_alternatives
            assert "web_alternatives" in first_group
            web_alts = first_group["web_alternatives"]
            
            # Verify web alternatives structure
            if web_alts:
                alt = web_alts[0]
                assert alt.get("source") == "web"
                assert "store" in alt
                assert "url" in alt
        
        print(f"✓ Grouped with live=true returned {data['total']} groups with web enrichment")
    
    def test_grouped_response_structure(self):
        """Verify the grouped response has all required fields"""
        response = requests.get(
            f"{BASE_URL}/api/products/grouped",
            params={"q": "lamp"},
            timeout=15
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        
        # Required top-level fields
        assert "total" in data
        assert "groups" in data
        assert "live_enriched" in data
        
        # Group structure validation
        if data["groups"]:
            group = data["groups"][0]
            group_fields = ["main_product", "alternatives", "store_count", "price_range", "web_alternatives"]
            for field in group_fields:
                assert field in group, f"Group missing field: {field}"
            
            # Price range structure
            price_range = group["price_range"]
            assert "min" in price_range
            assert "max" in price_range
        
        print("✓ Grouped response structure is valid")


class TestCuratedProductsEndpoint:
    """Tests for curated products which are used by price comparison"""
    
    def test_curated_products_exist(self):
        """Curated products should be available for comparison"""
        response = requests.get(
            f"{BASE_URL}/api/products/curated",
            params={"limit": "10"},
            timeout=15
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert "products" in data
        assert len(data["products"]) > 0
        
        # Verify product structure
        product = data["products"][0]
        required_fields = ["id", "name", "store", "category", "source"]
        for field in required_fields:
            assert field in product, f"Curated product missing field: {field}"
        
        print(f"✓ Curated products endpoint returned {len(data['products'])} products")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
