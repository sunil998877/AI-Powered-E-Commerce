import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_neo4j_health_endpoint():
    res = client.get("/health/neo4j")
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "connected"


def test_stats_endpoint():
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["products"] == 20
    assert data["brands"] >= 6
    assert data["categories"] >= 6
    assert data["vendors"] >= 6
    assert data["customers"] >= 15
    assert data["orders"] >= 20
    assert data["banana"] == 5


def test_banana_endpoint():
    res = client.get("/api/banana")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5
    for i, item in enumerate(data, start=1):
        assert item["id"] == f"BANANA_00{i}"
        assert item["value"] == "banana"


def test_ask_endpoint_normal_question():
    res = client.post("/api/ask", json={"question": "Which Samsung products are supplied by TechWorld?"})
    assert res.status_code == 200
    data = res.json()
    assert "cypher" in data
    assert "results" in data
    assert len(data["results"]) >= 2
    assert "Galaxy S25" in data["answer"] or "galaxy s25" in data["answer"].lower()


def test_ask_endpoint_grounding_unknown():
    res = client.post("/api/ask", json={"question": "Who is the CEO of Apple?"})
    assert res.status_code == 200
    data = res.json()
    assert data["results"] == []
    assert "The requested information is not available in the knowledge graph." in data["answer"]


def test_ask_endpoint_empty_question():
    res = client.post("/api/ask", json={"question": "   "})
    assert res.status_code in [400, 422]


def test_graph_visualization_endpoint():
    res = client.get("/api/graph")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "links" in data
    assert len(data["nodes"]) > 0
    assert len(data["links"]) > 0
