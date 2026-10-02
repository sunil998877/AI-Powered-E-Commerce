# Backend — E-Commerce AI Knowledge Graph API (MVC Architecture)

FastAPI backend orchestrating LLM Natural Language to Cypher translation, query safety validation, Neo4j graph retrieval, and grounded answer synthesis.

---

## 1. Architecture Overview (MVC Pattern)

The backend is organized cleanly following enterprise MVC design principles:

```
backend/
├── app/
│   ├── config.py                 # Pydantic BaseSettings (Neo4j, OpenAI, ports)
│   ├── main.py                   # FastAPI initialization, CORS, lifespan, router mount
│   ├── models/                   # M - Schema & Cypher Query models
│   │   ├── schema.py             # Knowledge Graph schema definitions & constraints
│   │   └── queries.py            # Pre-compiled Cypher queries (stats, banana, graph)
│   ├── views/                    # V - Pydantic Response/Request ViewModels
│   │   └── schemas.py            # AskRequestView, AskResponseView, StatsResponseView, etc.
│   ├── controllers/              # C - API Route Controllers
│   │   ├── ask_controller.py     # POST /api/ask (NL -> Cypher -> Neo4j -> Answer)
│   │   ├── stats_controller.py   # GET /api/stats (Graph counts & metrics)
│   │   ├── banana_controller.py  # GET /api/banana (Mandatory 5 banana nodes)
│   │   ├── graph_controller.py   # GET /api/graph (Nodes & links for visualizer)
│   │   └── health_controller.py  # GET /health, GET /health/neo4j
│   ├── services/                 # Business Logic & Orchestration
│   │   ├── llm_service.py        # Two-stage LLM (Cypher generation & grounded answers)
│   │   ├── retrieval_service.py  # Neo4j query execution & JSON serialization
│   │   └── validator_service.py  # Read-only Cypher query validation & security
│   └── repositories/             # Data Access Layer
│       ├── neo4j_connection.py   # Thread-safe Neo4j driver connection manager
│       └── graph_loader.py       # Deterministic dataset loader with MERGE logic
├── tests/                        # 18 Automated Pytest Test Cases
│   ├── test_api.py               # API endpoint tests
│   ├── test_banana.py            # Banana requirement tests (exact 5 count)
│   ├── test_graph.py             # Schema & node count tests (20 products)
│   └── test_retrieval.py         # Cypher validation, retrieval, anti-hallucination
└── requirements.txt
```

---

## 2. Quickstart Instructions

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Environment Configuration
Create a `.env` file in `backend/`:
```ini
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```
*(Note: If no OpenAI API key is supplied, the system automatically falls back to its built-in schema-driven query engine).*

### Step 3: Load the 20-Product Dataset into Neo4j
```bash
python -m app.graph.loader
```

Expected output:
```
INFO - Knowledge Graph verification statistics: {
  'products': 20, 'brands': 9, 'categories': 10,
  'vendors': 6, 'customers': 15, 'orders': 20, 'banana': 5
}
INFO - Banana verification count: 5 (Expected: 5)
INFO - Knowledge Graph dataset loaded and verified successfully!
```

### Step 4: Run the Automated Test Suite
```bash
python -m pytest tests/ -v
```
*(All 18 tests will pass: graph schema, banana count, API endpoints, retrieval, and anti-hallucination).*

### Step 5: Start the FastAPI Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation is available interactively at `http://127.0.0.1:8000/docs`.
