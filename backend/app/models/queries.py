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

ALL_ENTITIES_QUERY = """
MATCH (n)
RETURN labels(n)[0] AS type, properties(n) AS props
ORDER BY type, props.id
LIMIT 500
"""

NODES_QUERY = """
MATCH (n)
RETURN elementId(n) AS eid,
       labels(n)[0] AS type,
       properties(n) AS props
LIMIT 200
"""

EDGES_QUERY = """
MATCH (s)-[r]->(t)
RETURN elementId(s) AS source_eid, s.id AS source_id,
       elementId(t) AS target_eid, t.id AS target_id,
       type(r) AS rel_type,
       elementId(r) AS rel_id
LIMIT 300
"""
