# AI-Powered E-Commerce Knowledge Graph Retrieval System

A production-ready full-stack Knowledge Graph and AI-powered natural language retrieval system built with **Python (FastAPI MVC)**, **Neo4j Graph Database**, **OpenAI LLM**, and **React 18 (Vite + Tailwind CSS)**.

---

## 1. Submission Deliverables Checklist

| Deliverable | Status | Location / Reference |
| :--- | :---: | :--- |
| **Working Python project** | Complete | [`backend/`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/backend) (FastAPI, MVC architecture, Pydantic v2, Neo4j driver) |
| **Sample e-commerce dataset** | Complete | [`data/ecommerce.json`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/data/ecommerce.json) (Exactly 20 products, 9 brands, 10 categories, 6 vendors, 15 customers, 20 orders) |
| **Knowledge Graph implementation** | Complete | Neo4j native graph with idempotent `MERGE`, uniqueness constraints, line-item quantities |
| **Retrieval system** | Complete | [`backend/app/services/retrieval_service.py`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/backend/app/services/retrieval_service.py) & [`validator_service.py`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/backend/app/services/validator_service.py) (Read-only Cypher validation, JSON serializer) |
| **LLM integration** | Complete | [`backend/app/services/llm_service.py`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/backend/app/services/llm_service.py) (Two-stage LLM: NL➔Cypher and Graph Data➔Grounded Answer) |
| **At least 5 sample questions with results** | Complete | [`examples/sample_questions.md`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/examples/sample_questions.md) (10 real query executions with Cypher, JSON data, and final answers) |
| **README file with complete instructions** | Complete | This document & [`backend/README.md`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/backend/README.md) |
| **Loom video walkthrough script** | Complete | [`LOOM_SCRIPT.md`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/LOOM_SCRIPT.md) (Complete speaking script and demo flow covering all required topics) |

---

## 2. System Architecture

The project implements a two-stage retrieval-augmented graph pipeline with read-only Cypher query validation and strict fact grounding:

```
                      User Question (Natural Language)
                                     │
                                     ▼
                ┌───────────────────────────────────────────┐
                │  Stage 1: LLM (GPT-4o-mini / Fallback)    │
                │  Translates question to safe Cypher query │
                └───────────────────────────────────────────┘
                                     │
                                     ▼
                ┌───────────────────────────────────────────┐
                │  Cypher Security & Validation Guardrail   │
                │  Blocks mutations (CREATE, DELETE, etc.)  │
                └───────────────────────────────────────────┘
                                     │
                                     ▼
                ┌───────────────────────────────────────────┐
                │  Neo4j Knowledge Graph (Bolt :7687)       │
                │  Executes read-only Cypher query          │
                └───────────────────────────────────────────┘
                                     │
                                     ▼
                ┌───────────────────────────────────────────┐
                │  Structured Graph Records (JSON)          │
                └───────────────────────────────────────────┘
                                     │
                                     ▼
                ┌───────────────────────────────────────────┐
                │  Stage 2: LLM (Strict Answer Synthesis)   │
                │  Answers using ONLY retrieved graph data  │
                └───────────────────────────────────────────┘
                                     │
                                     ▼
                 Grounded Answer + Generated Cypher + Records
```

### Backend MVC Directory Structure
```
backend/
├── app/
│   ├── config.py                 # Pydantic Settings & Environment Variables
│   ├── main.py                   # FastAPI Application Root & CORS Middleware
│   ├── models/                   # Model: Schema definitions & Cypher queries
│   │   ├── schema.py             # Node labels, relationship types & schema text
│   │   └── queries.py            # Pre-compiled Cypher queries (stats, banana)
│   ├── views/                    # View: Pydantic ViewModels & API Schemas
│   │   └── schemas.py            # AskRequestView, AskResponseView, StatsResponseView
│   ├── controllers/              # Controller: Request routing & response handling
│   │   ├── ask_controller.py     # POST /api/ask (Two-stage query pipeline)
│   │   ├── stats_controller.py   # GET /api/stats (Graph counts)
│   │   ├── banana_controller.py  # GET /api/banana (Mandatory 5 banana nodes)
│   │   ├── graph_controller.py   # GET /api/graph (Nodes & links for visualizer)
│   │   └── health_controller.py  # GET /health, GET /health/neo4j
│   ├── services/                 # Business Logic & Orchestration
│   │   ├── llm_service.py        # Stage 1 & Stage 2 LLM pipelines
│   │   ├── retrieval_service.py  # Neo4j query execution & serialization
│   │   └── validator_service.py  # AST/keyword read-only Cypher validation
│   └── repositories/             # Persistence & Data Access
│       ├── neo4j_connection.py   # Neo4j driver connection lifecycle
│       └── graph_loader.py       # Deterministic MERGE graph loader
├── tests/                        # 18 Pytest unit and integration tests
└── requirements.txt
```

---

## 3. Knowledge Graph Schema

### Entity Node Types & Properties
* **`Product`**: `id`, `name`, `price`, `stock` (e.g. `P001`, `Galaxy S25`, `₹79,999`, `50`)
* **`Brand`**: `id`, `name` (e.g. `B001`, `Samsung`)
* **`Category`**: `id`, `name` (e.g. `C001`, `Smartphones`)
* **`Vendor`**: `id`, `name`, `location` (e.g. `V001`, `TechWorld`, `Bangalore`)
* **`Customer`**: `id`, `name`, `email` (e.g. `CU001`, `Rahul Kumar`, `rahul.kumar@example.com`)
* **`Order`**: `id`, `order_date`, `status`, `total_amount` (e.g. `ORD001`, `2026-09-01`, `DELIVERED`, `₹109,997`)
* **`Keyword`**: `id`, `value` (`BANANA_001` through `BANANA_005`, `value = "banana"`)

### Graph Relationships
```
Brand    ──[:HAS_PRODUCT]──> Product
Product  ──[:BELONGS_TO]───> Category
Product  ──[:SUPPLIED_BY]──> Vendor
Customer ──[:PLACED]───────> Order
Order    ──[:CONTAINS {quantity: n}]──> Product
```

---

## 4. The 20-Product Dataset Specification

The source dataset is located at [`data/ecommerce.json`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/data/ecommerce.json).

* **Products (Exactly 20)**: `P001` through `P020`
  1. `P001` — Galaxy S25 (Samsung, Smartphones, TechWorld)
  2. `P002` — Galaxy S25 Ultra (Samsung, Smartphones, ABC Traders)
  3. `P003` — Galaxy Buds 3 (Samsung, Audio, TechWorld)
  4. `P004` — iPhone 17 (Apple, Smartphones, Global Electronics)
  5. `P005` — iPhone 17 Pro (Apple, Smartphones, Digital Hub)
  6. `P006` — MacBook Air M4 (Apple, Laptops, TechWorld)
  7. `P007` — AirPods Pro (Apple, Audio, Global Electronics)
  8. `P008` — Sony WH-1000XM6 (Sony, Audio, TechWorld)
  9. `P009` — Sony Bravia TV (Sony, TVs, Prime Distributors)
  10. `P010` — Dell XPS 15 (Dell, Laptops, Digital Hub)
  11. `P011` — Lenovo ThinkPad X1 (Lenovo, Laptops, ABC Traders)
  12. `P012` — HP Spectre x360 (HP, Laptops, SmartTech Supplies)
  13. `P013` — Apple Watch Series 11 (Apple, Wearables, Digital Hub)
  14. `P014` — Galaxy Watch 8 (Samsung, Wearables, TechWorld)
  15. `P015` — Sony Alpha Camera (Sony, Cameras, Prime Distributors)
  16. `P016` — Logitech MX Master 3S (Logitech, Accessories, TechWorld)
  17. `P017` — Kindle Paperwhite (Amazon, E-readers, SmartTech Supplies)
  18. `P018` — Echo Dot (Amazon, Smart Home, ABC Traders)
  19. `P019` — Samsung 4K Monitor (Samsung, Monitors, Global Electronics)
  20. `P020` — Anker Power Bank (Anker, Accessories, Prime Distributors)
* **Brands (9)**: Samsung, Apple, Sony, Dell, Lenovo, HP, Logitech, Amazon, Anker.
* **Categories (10)**: Smartphones, Laptops, Audio, Wearables, Smart Home, Accessories, Cameras, Monitors, E-readers, TVs.
* **Vendors (6)**: TechWorld, ABC Traders, Global Electronics, Digital Hub, Prime Distributors, SmartTech Supplies.
* **Customers (15)**: `CU001` through `CU015`.
* **Orders (20)**: `ORD001` through `ORD020` with line-item quantities.

---

## 5. Mandatory Banana Requirement Implementation

* **Graph Nodes**: The graph loader explicitly creates exactly 5 Keyword nodes outside the product catalog:
  ```cypher
  (:Keyword {id: "BANANA_001", value: "banana"})
  (:Keyword {id: "BANANA_002", value: "banana"})
  (:Keyword {id: "BANANA_003", value: "banana"})
  (:Keyword {id: "BANANA_004", value: "banana"})
  (:Keyword {id: "BANANA_005", value: "banana"})
  ```
* **Verification Cypher**:
  ```cypher
  MATCH (n:Keyword)
  WHERE n.value = "banana"
  RETURN count(n) AS banana_count;
  ```
  Expected and verified result: **`5`**.
* **API Endpoint**: `GET /api/banana` returns all 5 Keyword nodes.
* **UI Status**: Displays an active **5/5 PASSED** verification badge on the dashboard.

---

## 6. Anti-Hallucination & Fact Grounding

To guarantee that answers are strictly grounded in retrieved graph data:
1. **Schema-Constrained Cypher**: LLM Stage 1 is restricted strictly to the defined graph schema.
2. **Missing Property Defense**: If the question asks for attributes not present in the graph (e.g. *"Who is the CEO of Apple?"* or *"What is Samsung's market cap?"*), the query generator yields no records (`MATCH (b:Brand) WHERE false RETURN b`).
3. **Empty Data Handling**: If the database query returns 0 rows (`[]`), LLM Stage 2 is explicitly constrained to return:
   > *"The requested information is not available in the knowledge graph."*
   External knowledge (e.g. naming famous executives) is never hallucinated.

---

## 7. Setup & Execution Instructions

### Prerequisites
* Python 3.10+ (tested on Python 3.12)
* Node.js 18+ & npm
* Neo4j Database (Desktop, Community Server, or Docker)

### Step 1: Start Neo4j
If using Docker:
```bash
docker-compose up -d
```
Default connection: `bolt://localhost:7687` with username `neo4j` and password `password123`.

### Step 2: Configure Environment
In `backend/.env`:
```ini
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

### Step 3: Install Backend Dependencies & Load Graph
```bash
cd backend
pip install -r requirements.txt
python -m app.graph.loader
```

### Step 4: Run Backend Tests
```bash
python -m pytest tests/ -v
```
All **18 automated tests** will pass:
* `test_api.py`: 8 endpoint tests
* `test_banana.py`: 2 banana count & ID tests
* `test_graph.py`: 4 schema & node count tests
* `test_retrieval.py`: 4 Cypher validation & anti-hallucination tests

### Step 5: Start the Backend Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API docs: `http://127.0.0.1:8000/docs`

### Step 6: Start the Frontend UI
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5174/` (or the port indicated by Vite) in your browser.

---

## 8. Sample Questions & Verified Results

Here are 5 representative queries from [`examples/sample_questions.md`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/examples/sample_questions.md):

### 1. Which Samsung products are supplied by TechWorld?
* **Generated Cypher**:
  ```cypher
  MATCH (b:Brand)-[:HAS_PRODUCT]->(p:Product)-[:SUPPLIED_BY]->(v:Vendor)
  WHERE toLower(b.name) = toLower("Samsung") AND toLower(v.name) = toLower("TechWorld")
  RETURN p.name AS product_name, p.price AS price
  ```
* **Answer**: The Samsung products supplied by TechWorld are: Galaxy S25, Galaxy Buds 3, and Galaxy Watch 8.

### 2. Which products belong to the Smartphones category?
* **Generated Cypher**:
  ```cypher
  MATCH (p:Product)-[:BELONGS_TO]->(c:Category)
  WHERE toLower(c.name) = toLower("Smartphones")
  RETURN p.name AS product_name, p.price AS price, p.stock AS stock
  ```
* **Answer**: The products belonging to the Smartphones category are Galaxy S25, Galaxy S25 Ultra, iPhone 17, and iPhone 17 Pro.

### 3. What products did Rahul Kumar order?
* **Generated Cypher**:
  ```cypher
  MATCH (c:Customer)-[:PLACED]->(o:Order)-[r:CONTAINS]->(p:Product)
  WHERE toLower(c.name) = toLower("Rahul Kumar")
  RETURN o.id AS order_id, p.name AS product_name, r.quantity AS quantity, p.price AS price
  ```
* **Answer**: Rahul Kumar ordered Galaxy S25 (1 unit) and Galaxy Buds 3 (2 units) in order ORD001, and Galaxy Watch 8 (1 unit) in order ORD016.

### 4. Which vendors supply Samsung products?
* **Generated Cypher**:
  ```cypher
  MATCH (b:Brand)-[:HAS_PRODUCT]->(p:Product)-[:SUPPLIED_BY]->(v:Vendor)
  WHERE toLower(b.name) = toLower("Samsung")
  RETURN DISTINCT v.name AS vendor_name, v.location AS location
  ```
* **Answer**: The vendors supplying Samsung products are TechWorld (Bangalore), ABC Traders (Mumbai), and Global Electronics (Delhi).

### 5. Who is the CEO of Apple? (Grounding / Anti-Hallucination)
* **Generated Cypher**:
  ```cypher
  MATCH (b:Brand) WHERE false RETURN b
  ```
* **Retrieved Data**: `[]`
* **Answer**: *"The requested information is not available in the knowledge graph."*

---

## 9. Loom Video Recording Script

A complete, structured walkthrough script is provided in [`LOOM_SCRIPT.md`](file:///c:/Users/skp66/.gemini/antigravity-ide/scratch/ecommerce-ai-knowledge-graph/LOOM_SCRIPT.md) to facilitate recording the required Loom presentation.
# AI-Powered-E-Commerce
