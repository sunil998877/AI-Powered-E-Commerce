# Sample Questions & Actual Results (20-Product Dataset)

This document contains real query executions from the live E-Commerce AI Knowledge Graph retrieval system using the 20-product dataset. Every query is translated by LLM Stage 1 into read-only Cypher, validated by the security validator, executed against Neo4j, and summarized by LLM Stage 2.

---

### Question 1: Which Samsung products are supplied by TechWorld?
* **Question**: `Which Samsung products are supplied by TechWorld?`
* **Generated Cypher**:
  ```cypher
  MATCH (b:Brand)-[:HAS_PRODUCT]->(p:Product)-[:SUPPLIED_BY]->(v:Vendor)
  WHERE toLower(b.name) = toLower("Samsung") AND toLower(v.name) = toLower("TechWorld")
  RETURN p.name AS product_name, p.price AS price
  ```
* **Retrieved Data**:
  ```json
  [
    { "product_name": "Galaxy S25", "price": 79999 },
    { "product_name": "Galaxy Buds 3", "price": 14999 },
    { "product_name": "Galaxy Watch 8", "price": 31999 }
  ]
  ```
* **Final Answer**:
  > The Samsung products supplied by TechWorld are: Galaxy S25, Galaxy Buds 3, and Galaxy Watch 8.

---

### Question 2: Which products belong to the Smartphones category?
* **Question**: `Which products belong to the Smartphones category?`
* **Generated Cypher**:
  ```cypher
  MATCH (p:Product)-[:BELONGS_TO]->(c:Category)
  WHERE toLower(c.name) = toLower("Smartphones")
  RETURN p.name AS product_name, p.price AS price, p.stock AS stock
  ```
* **Retrieved Data**:
  ```json
  [
    { "product_name": "Galaxy S25", "price": 79999, "stock": 50 },
    { "product_name": "Galaxy S25 Ultra", "price": 129999, "stock": 30 },
    { "product_name": "iPhone 17", "price": 89999, "stock": 40 },
    { "product_name": "iPhone 17 Pro", "price": 134999, "stock": 25 }
  ]
  ```
* **Final Answer**:
  > The products belonging to the Smartphones category are Galaxy S25, Galaxy S25 Ultra, iPhone 17, and iPhone 17 Pro.

---

### Question 3: Which products are supplied by TechWorld?
* **Question**: `Which products are supplied by TechWorld?`
* **Generated Cypher**:
  ```cypher
  MATCH (p:Product)-[:SUPPLIED_BY]->(v:Vendor)
  WHERE toLower(v.name) = toLower("TechWorld")
  RETURN p.name AS product_name, p.price AS price
  ```
* **Retrieved Data**:
  ```json
  [
    { "product_name": "Galaxy S25", "price": 79999 },
    { "product_name": "Galaxy Buds 3", "price": 14999 },
    { "product_name": "MacBook Air M4", "price": 114999 },
    { "product_name": "Sony WH-1000XM6", "price": 32990 },
    { "product_name": "Galaxy Watch 8", "price": 31999 },
    { "product_name": "Logitech MX Master 3S", "price": 9995 }
  ]
  ```
* **Final Answer**:
  > The products supplied by TechWorld are Galaxy S25, Galaxy Buds 3, MacBook Air M4, Sony WH-1000XM6, Galaxy Watch 8, and Logitech MX Master 3S.

---

### Question 4: What products did Rahul Kumar order?
* **Question**: `What products did Rahul Kumar order?`
* **Generated Cypher**:
  ```cypher
  MATCH (c:Customer)-[:PLACED]->(o:Order)-[r:CONTAINS]->(p:Product)
  WHERE toLower(c.name) = toLower("Rahul Kumar")
  RETURN o.id AS order_id, p.name AS product_name, r.quantity AS quantity, p.price AS price
  ```
* **Retrieved Data**:
  ```json
  [
    { "order_id": "ORD001", "product_name": "Galaxy S25", "quantity": 1, "price": 79999 },
    { "order_id": "ORD001", "product_name": "Galaxy Buds 3", "quantity": 2, "price": 14999 },
    { "order_id": "ORD016", "product_name": "Galaxy Watch 8", "quantity": 1, "price": 31999 }
  ]
  ```
* **Final Answer**:
  > Rahul Kumar ordered the following products: Galaxy S25 (1 unit) and Galaxy Buds 3 (2 units) in order ORD001, and Galaxy Watch 8 (1 unit) in order ORD016.

---

### Question 5: Which vendors supply Samsung products?
* **Question**: `Which vendors supply Samsung products?`
* **Generated Cypher**:
  ```cypher
  MATCH (b:Brand)-[:HAS_PRODUCT]->(p:Product)-[:SUPPLIED_BY]->(v:Vendor)
  WHERE toLower(b.name) = toLower("Samsung")
  RETURN DISTINCT v.name AS vendor_name, v.location AS location
  ```
* **Retrieved Data**:
  ```json
  [
    { "vendor_name": "TechWorld", "location": "Bangalore" },
    { "vendor_name": "ABC Traders", "location": "Mumbai" },
    { "vendor_name": "Global Electronics", "location": "Delhi" }
  ]
  ```
* **Final Answer**:
  > The vendors supplying Samsung products are TechWorld (Bangalore), ABC Traders (Mumbai), and Global Electronics (Delhi).

---

### Question 6: Which products are in order ORD001?
* **Question**: `Which products are in order ORD001?`
* **Generated Cypher**:
  ```cypher
  MATCH (o:Order)-[r:CONTAINS]->(p:Product)
  WHERE o.id = "ORD001"
  RETURN p.id AS product_id, p.name AS product_name, r.quantity AS quantity, p.price AS price
  ```
* **Retrieved Data**:
  ```json
  [
    { "product_id": "P001", "product_name": "Galaxy S25", "quantity": 1, "price": 79999 },
    { "product_id": "P003", "product_name": "Galaxy Buds 3", "quantity": 2, "price": 14999 }
  ]
  ```
* **Final Answer**:
  > Order ORD001 contains 1x Galaxy S25 (₹79,999) and 2x Galaxy Buds 3 (₹14,999 each).

---

### Question 7: How many products does Samsung have?
* **Question**: `How many products does Samsung have?`
* **Generated Cypher**:
  ```cypher
  MATCH (b:Brand)-[:HAS_PRODUCT]->(p:Product)
  WHERE toLower(b.name) = toLower("Samsung")
  RETURN count(p) AS product_count
  ```
* **Retrieved Data**:
  ```json
  [
    { "product_count": 5 }
  ]
  ```
* **Final Answer**:
  > Samsung has 5 products in the knowledge graph: Galaxy S25, Galaxy S25 Ultra, Galaxy Buds 3, Galaxy Watch 8, and Samsung 4K Monitor.

---

### Question 8: How many products does TechWorld supply?
* **Question**: `How many products does TechWorld supply?`
* **Generated Cypher**:
  ```cypher
  MATCH (p:Product)-[:SUPPLIED_BY]->(v:Vendor)
  WHERE toLower(v.name) = toLower("TechWorld")
  RETURN count(p) AS supplied_count
  ```
* **Retrieved Data**:
  ```json
  [
    { "supplied_count": 6 }
  ]
  ```
* **Final Answer**:
  > TechWorld supplies 6 products across brands Samsung, Apple, Sony, and Logitech.

---

### Question 9: Which customers placed orders containing Galaxy S25?
* **Question**: `Which customers placed orders containing Galaxy S25?`
* **Generated Cypher**:
  ```cypher
  MATCH (c:Customer)-[:PLACED]->(o:Order)-[:CONTAINS]->(p:Product)
  WHERE toLower(p.name) CONTAINS toLower("Galaxy S25") AND toLower(p.name) <> toLower("Galaxy S25 Ultra")
  RETURN DISTINCT c.name AS customer_name, c.email AS email, o.id AS order_id
  ```
* **Retrieved Data**:
  ```json
  [
    { "customer_name": "Rahul Kumar", "email": "rahul.kumar@example.com", "order_id": "ORD001" },
    { "customer_name": "Ananya Singh", "email": "ananya.singh@example.com", "order_id": "ORD007" },
    { "customer_name": "Priya Singh", "email": "priya.singh@example.com", "order_id": "ORD018" }
  ]
  ```
* **Final Answer**:
  > The customers who placed orders containing Galaxy S25 are Rahul Kumar (ORD001), Ananya Singh (ORD007), and Priya Singh (ORD018).

---

### Question 10: How many banana values exist in the knowledge graph?
* **Question**: `How many banana values exist in the knowledge graph?`
* **Generated Cypher**:
  ```cypher
  MATCH (k:Keyword)
  WHERE k.value = "banana"
  RETURN count(k) AS banana_count
  ```
* **Retrieved Data**:
  ```json
  [
    { "banana_count": 5 }
  ]
  ```
* **Final Answer**:
  > There are exactly 5 Keyword nodes with the value "banana" in the knowledge graph (BANANA_001 through BANANA_005).

---

### Question 11 (Grounding / Unknown Info Check): Who is the CEO of Apple?
* **Question**: `Who is the CEO of Apple?`
* **Generated Cypher**:
  ```cypher
  MATCH (b:Brand)
  WHERE toLower(b.name) = toLower("Apple")
  RETURN b.ceo AS ceo
  ```
* **Retrieved Data**:
  ```json
  []
  ```
* **Final Answer**:
  > The requested information is not available in the knowledge graph.
