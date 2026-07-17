"""Offline contract smoke for the FastAPI endpoints used by the stdio MCP server."""

import asyncio

import httpx

from app.db.session import init_db
from app.main import app


async def main() -> None:
    await init_db()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://salepilot.test") as client:
        products = await client.get("/mcp/products", params={"query": "inverter", "limit": 2})
        assert products.status_code == 200, products.text
        product_page = products.json()
        assert product_page["count"] == 2 and product_page["total_count"] >= 2, product_page

        detail = await client.get("/mcp/products/AC-002")
        assert detail.status_code == 200 and detail.json()["sku"] == "AC-002", detail.text

        comparison = await client.post(
            "/mcp/product-comparisons",
            json={"skus": ["AC-002", "AC-010"]},
        )
        assert comparison.status_code == 200 and comparison.json()["ok"], comparison.text

        recommendation = await client.post(
            "/mcp/recommendations",
            json={"room_m2": 12, "budget_vnd": 10_000_000, "priorities": ["em"]},
        )
        assert recommendation.status_code == 200 and recommendation.json()["top3"], recommendation.text

        faq = await client.get("/mcp/knowledge/faq", params={"query": "lắp đặt", "limit": 2})
        assert faq.status_code == 200 and faq.json()["count"] > 0, faq.text

        blocked_write = await client.post(
            "/mcp/leads",
            json={"confirmed": True, "phone": "0909999888", "interest": "Máy lạnh"},
        )
        assert blocked_write.status_code in {401, 503}, blocked_write.text

    print("OK MCP API catalog, recommendation, FAQ, and protected lead write")


if __name__ == "__main__":
    asyncio.run(main())
