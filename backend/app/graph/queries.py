from neo4j import Session
from typing import Dict, List, Any

STATS_QUERY = """
MATCH (p:Product) WITH count(p) AS products
MATCH (b:Brand) WITH products, count(b) AS brands
MATCH (cat:Category) WITH products, brands, count(cat) AS categories
MATCH (v:Vendor) WITH products, brands, categories, count(v) AS vendors
MATCH (c:Customer) WITH products, brands, categories, vendors, count(c) AS customers
MATCH (o:Order) WITH products, brands, categories, vendors, customers, count(o) AS orders
OPTIONAL MATCH (k:Keyword) WHERE k.value = 'banana'
WITH products, brands, categories, vendors, customers, orders, count(k) AS banana
RETURN {
    products: products,
    brands: brands,
    categories: categories,
    vendors: vendors,
    customers: customers,
    orders: orders,
    banana: banana
} AS stats
"""

BANANA_COUNT_QUERY = """
MATCH (n:Keyword)
WHERE n.value = "banana"
RETURN count(n) AS banana_count
"""

BANANA_NODES_QUERY = """
MATCH (n:Keyword)
WHERE n.value = "banana"
RETURN n.id AS id, n.value AS value
ORDER BY n.id
"""

GRAPH_VISUALIZATION_QUERY = """
MATCH (n)
WHERE NOT n:Keyword OR n.value = 'banana'
OPTIONAL MATCH (n)-[r]->(m)
WHERE m IS NULL OR NOT m:Keyword OR m.value = 'banana'
RETURN n, r, m
LIMIT 300
"""

ALL_ENTITIES_QUERY = """
MATCH (n)
RETURN labels(n)[0] AS type, properties(n) AS props
ORDER BY type, props.id
LIMIT 500
"""

def get_graph_stats(session: Session) -> Dict[str, int]:
    """Returns entity counts for products, brands, categories, vendors, customers, orders, and banana."""
    record = session.run(STATS_QUERY).single()
    if record and record.get("stats"):
        return record["stats"]
    return {
        "products": 0,
        "brands": 0,
        "categories": 0,
        "vendors": 0,
        "customers": 0,
        "orders": 0,
        "banana": 0
    }

def get_banana_nodes(session: Session) -> List[Dict[str, str]]:
    """Returns the five banana Keyword nodes as required by Requirement 8."""
    result = session.run(BANANA_NODES_QUERY)
    return [{"id": record["id"], "value": record["value"]} for record in result]
