import pytest
from app.graph.connection import Neo4jConnection
from app.graph.schema import ENTITY_TYPES, RELATIONSHIP_TYPES


def test_neo4j_connection():
    health = Neo4jConnection.check_connection()
    assert health.get("status") == "connected", f"Neo4j should be connected: {health}"


def test_required_node_labels_exist():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        result = session.run("CALL db.labels()")
        labels = [record[0] for record in result]
        for expected in ENTITY_TYPES:
            assert expected in labels, f"Expected node label '{expected}' not found in Neo4j. Existing: {labels}"


def test_required_relationships_exist():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        result = session.run("CALL db.relationshipTypes()")
        rel_types = [record[0] for record in result]
        for expected in RELATIONSHIP_TYPES:
            assert expected in rel_types, f"Expected relationship '{expected}' not found. Existing: {rel_types}"


def test_dataset_node_counts():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        brands = session.run("MATCH (b:Brand) RETURN count(b) AS c").single()["c"]
        products = session.run("MATCH (p:Product) RETURN count(p) AS c").single()["c"]
        categories = session.run("MATCH (c:Category) RETURN count(c) AS c").single()["c"]
        vendors = session.run("MATCH (v:Vendor) RETURN count(v) AS c").single()["c"]
        customers = session.run("MATCH (c:Customer) RETURN count(c) AS c").single()["c"]
        orders = session.run("MATCH (o:Order) RETURN count(o) AS c").single()["c"]

        assert brands >= 6, f"Expected at least 6 brands, got {brands}"
        assert products == 20, f"Expected exactly 20 products, got {products}"
        assert categories >= 6, f"Expected at least 6 categories, got {categories}"
        assert vendors >= 6, f"Expected at least 6 vendors, got {vendors}"
        assert customers >= 15, f"Expected at least 15 customers, got {customers}"
        assert orders >= 20, f"Expected at least 20 orders, got {orders}"
