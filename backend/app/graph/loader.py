import json
import logging
import sys
from pathlib import Path

# Add backend directory to sys.path so it works regardless of invocation directory
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.graph.connection import Neo4jConnection
from app.graph.queries import BANANA_COUNT_QUERY, STATS_QUERY

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def create_constraints_and_indexes(session):
    logger.info("Ensuring uniqueness constraints and indexes...")
    constraints = [
        "CREATE CONSTRAINT brand_id_unique IF NOT EXISTS FOR (b:Brand) REQUIRE b.id IS UNIQUE",
        "CREATE CONSTRAINT category_id_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT vendor_id_unique IF NOT EXISTS FOR (v:Vendor) REQUIRE v.id IS UNIQUE",
        "CREATE CONSTRAINT product_id_unique IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE",
        "CREATE CONSTRAINT customer_id_unique IF NOT EXISTS FOR (c:Customer) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT order_id_unique IF NOT EXISTS FOR (o:Order) REQUIRE o.id IS UNIQUE",
        "CREATE CONSTRAINT keyword_id_unique IF NOT EXISTS FOR (k:Keyword) REQUIRE k.id IS UNIQUE",
    ]
    for c in constraints:
        try:
            session.run(c)
        except Exception as e:
            logger.warning(f"Constraint creation notice: {e}")


def load_ecommerce_dataset(data_path: Path = None, clear_first: bool = True):
    if data_path is None:
        data_path = settings.DATA_PATH

    if not data_path.exists():
        raise FileNotFoundError(f"Dataset file not found at {data_path}")

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    driver = Neo4jConnection.get_driver()

    with driver.session() as session:
        if clear_first:
            logger.info("Clearing existing graph data for clean deterministic state...")
            session.run("MATCH (n) DETACH DELETE n")

        create_constraints_and_indexes(session)

        # 1. Load Brands
        logger.info(f"Loading {len(data.get('brands', []))} Brands...")
        for brand in data.get("brands", []):
            session.run(
                """
                MERGE (b:Brand {id: $id})
                SET b.name = $name
                """,
                id=brand["id"],
                name=brand["name"],
            )

        # 2. Load Categories
        logger.info(f"Loading {len(data.get('categories', []))} Categories...")
        for category in data.get("categories", []):
            session.run(
                """
                MERGE (c:Category {id: $id})
                SET c.name = $name
                """,
                id=category["id"],
                name=category["name"],
            )

        # 3. Load Vendors
        logger.info(f"Loading {len(data.get('vendors', []))} Vendors...")
        for vendor in data.get("vendors", []):
            session.run(
                """
                MERGE (v:Vendor {id: $id})
                SET v.name = $name, v.location = $location
                """,
                id=vendor["id"],
                name=vendor["name"],
                location=vendor["location"],
            )

        # 4. Load Products and connect Brand, Category, Vendor
        products = data.get("products", [])
        logger.info(f"Loading {len(products)} Products and relationships...")
        for prod in products:
            session.run(
                """
                MERGE (p:Product {id: $id})
                SET p.name = $name, p.price = $price, p.stock = $stock
                WITH p
                MATCH (b:Brand {id: $brand_id})
                MERGE (b)-[:HAS_PRODUCT]->(p)
                WITH p
                MATCH (c:Category {id: $category_id})
                MERGE (p)-[:BELONGS_TO]->(c)
                WITH p
                MATCH (v:Vendor {id: $vendor_id})
                MERGE (p)-[:SUPPLIED_BY]->(v)
                """,
                id=prod["id"],
                name=prod["name"],
                price=prod["price"],
                stock=prod["stock"],
                brand_id=prod["brand_id"],
                category_id=prod["category_id"],
                vendor_id=prod["vendor_id"],
            )

        # 5. Load Customers
        logger.info(f"Loading {len(data.get('customers', []))} Customers...")
        for cust in data.get("customers", []):
            session.run(
                """
                MERGE (c:Customer {id: $id})
                SET c.name = $name, c.email = $email
                """,
                id=cust["id"],
                name=cust["name"],
                email=cust["email"],
            )

        # 6. Load Orders and relationships (with quantity)
        orders = data.get("orders", [])
        logger.info(f"Loading {len(orders)} Orders and relationships...")
        for order in orders:
            session.run(
                """
                MERGE (o:Order {id: $id})
                SET o.order_date = $order_date, o.status = $status, o.total_amount = $total_amount
                WITH o
                MATCH (c:Customer {id: $customer_id})
                MERGE (c)-[:PLACED]->(o)
                """,
                id=order["id"],
                order_date=order["order_date"],
                status=order["status"],
                total_amount=order["total_amount"],
                customer_id=order["customer_id"],
            )
            # Support both { items: [{ product_id, quantity }] } and legacy product_ids
            items = order.get("items", [])
            if not items and "product_ids" in order:
                items = [{"product_id": pid, "quantity": 1} for pid in order["product_ids"]]

            for it in items:
                session.run(
                    """
                    MATCH (o:Order {id: $order_id})
                    MATCH (p:Product {id: $product_id})
                    MERGE (o)-[r:CONTAINS]->(p)
                    SET r.quantity = $quantity
                    """,
                    order_id=order["id"],
                    product_id=it["product_id"],
                    quantity=it.get("quantity", 1),
                )

        # 7. MANDATORY BANANA REQUIREMENT
        # Create exactly 5 Keyword nodes separately (not in product data)
        banana_keywords = [
            {"id": "BANANA_001", "value": "banana"},
            {"id": "BANANA_002", "value": "banana"},
            {"id": "BANANA_003", "value": "banana"},
            {"id": "BANANA_004", "value": "banana"},
            {"id": "BANANA_005", "value": "banana"},
        ]
        logger.info("Loading exactly 5 Keyword nodes for mandatory banana requirement...")
        for kw in banana_keywords:
            session.run(
                """
                MERGE (k:Keyword {id: $id})
                SET k.value = $value
                """,
                id=kw["id"],
                value=kw["value"],
            )

        # 8. Verify inserted graph counts
        stats_rec = session.run(STATS_QUERY).single()
        stats = stats_rec.get("stats") if stats_rec else {}
        logger.info(f"Knowledge Graph verification statistics: {stats}")

        banana_rec = session.run(BANANA_COUNT_QUERY).single()
        banana_count = banana_rec.get("banana_count") if banana_rec else 0
        logger.info(f"Banana verification count: {banana_count} (Expected: 5)")

        if banana_count != 5:
            raise ValueError(f"CRITICAL: Expected exactly 5 banana keywords, found {banana_count}!")

        if stats.get("products") != 20:
            raise ValueError(f"CRITICAL: Expected exactly 20 products, found {stats.get('products')}!")

        logger.info("Knowledge Graph dataset loaded and verified successfully!")
        return stats


if __name__ == "__main__":
    try:
        load_ecommerce_dataset()
    finally:
        Neo4jConnection.close()
