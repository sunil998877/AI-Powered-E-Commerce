import pytest
from app.graph.connection import Neo4jConnection
from app.graph.queries import BANANA_COUNT_QUERY, BANANA_NODES_QUERY


def test_banana_count_exactly_five():
    """Verify that the knowledge graph contains EXACTLY 5 Keyword nodes with value 'banana'."""
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        record = session.run(BANANA_COUNT_QUERY).single()
        count = record["banana_count"] if record else 0
        assert count == 5, f"CRITICAL: Knowledge Graph must contain exactly 5 banana nodes! Found: {count}"


def test_banana_nodes_retrievable_and_match_ids():
    """Verify all 5 banana nodes can be retrieved and have IDs BANANA_001 through BANANA_005."""
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        records = session.run(BANANA_NODES_QUERY).data()
        assert len(records) == 5, f"Expected 5 records, got {len(records)}"

        expected_ids = [f"BANANA_00{i}" for i in range(1, 6)]
        actual_ids = [r["id"] for r in records]
        assert actual_ids == expected_ids, f"Expected IDs {expected_ids}, got {actual_ids}"

        for r in records:
            assert r["value"] == "banana", f"Expected value 'banana', got {r['value']}"
