import pytest
from app.graph.connection import Neo4jConnection
from app.graph.schema import ENTITY_TYPES, RELATIONSHIP_TYPES


def test_neo4j_connection():
    health = Neo4jConnection.check_connection()
    assert health.get("status") == "connected"


def test_required_node_labels_exist():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        result = session.run("CALL db.labels()")
        labels = [record[0] for record in result]
        for expected in ENTITY_TYPES:
            assert expected in labels


def test_required_relationships_exist():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        result = session.run("CALL db.relationshipTypes()")
        rel_types = [record[0] for record in result]
        for expected in RELATIONSHIP_TYPES:
            assert expected in rel_types


def test_dataset_node_counts():
    driver = Neo4jConnection.get_driver()
    with driver.session() as session:
        brands = session.run("MATCH (b:Brand) RETURN count(b) AS c").single()["c"]
        products = session.run("MATCH (p:Product) RETURN count(p) AS c").single()["c"]
        categories = session.run("MATCH (c:Category) RETURN count(c) AS c").single()["c"]
        vendors = session.run("MATCH (v:Vendor) RETURN count(v) AS c").single()["c"]
        customers = session.run("MATCH (c:Customer) RETURN count(c) AS c").single()["c"]
        orders = session.run("MATCH (o:Order) RETURN count(o) AS c").single()["c"]

        assert brands >= 6
        assert products == 20
        assert categories >= 6
        assert vendors >= 6
        assert customers >= 15
        assert orders >= 20
