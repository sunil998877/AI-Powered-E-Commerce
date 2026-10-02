import pytest
from app.graph.connection import Neo4jConnection
from app.graph.queries import BANANA_COUNT_QUERY, BANANA_NODES_QUERY


def test_banana_count_exactly_five():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        record = session.run(BANANA_COUNT_QUERY).single()
        count = record["banana_count"] if record else 0
        assert count == 5


def test_banana_nodes_retrievable_and_match_ids():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        records = session.run(BANANA_NODES_QUERY).data()
        assert len(records) == 5

        expected_ids = [f"BANANA_00{i}" for i in range(1, 6)]
        actual_ids = [r["id"] for r in records]
        assert actual_ids == expected_ids

        for r in records:
            assert r["value"] == "banana"
