from typing import List, Dict, Any

ENTITY_TYPES: List[str] = [
    "Brand",
    "Category",
    "Vendor",
    "Product",
    "Customer",
    "Order",
    "Keyword",
]

RELATIONSHIP_TYPES: List[str] = [
    "HAS_PRODUCT",
    "BELONGS_TO",
    "SUPPLIED_BY",
    "PLACED",
    "CONTAINS",
]

GRAPH_SCHEMA_TEXT = """
Nodes and Properties:
- Brand {id: STRING, name: STRING}
- Category {id: STRING, name: STRING}
- Vendor {id: STRING, name: STRING, location: STRING}
- Product {id: STRING, name: STRING, price: INTEGER/FLOAT, stock: INTEGER}
- Customer {id: STRING, name: STRING, email: STRING}
- Order {id: STRING, order_date: STRING, status: STRING, total_amount: INTEGER/FLOAT}
- Keyword {id: STRING, value: STRING}

Relationships:
- (Brand)-[:HAS_PRODUCT]->(Product)
- (Product)-[:BELONGS_TO]->(Category)
- (Product)-[:SUPPLIED_BY]->(Vendor)
- (Customer)-[:PLACED]->(Order)
- (Order)-[:CONTAINS]->(Product)

Relationship Rules & Semantics:
- Brands have products: (b:Brand)-[:HAS_PRODUCT]->(p:Product)
- Products belong to categories: (p:Product)-[:BELONGS_TO]->(c:Category)
- Products are supplied by vendors: (p:Product)-[:SUPPLIED_BY]->(v:Vendor)
- Customers place orders: (c:Customer)-[:PLACED]->(o:Order)
- Orders contain products: (o:Order)-[:CONTAINS]->(p:Product)
- Keyword nodes store special search terms/values such as value = 'banana' with id like 'BANANA_001', 'BANANA_002', etc.
"""
