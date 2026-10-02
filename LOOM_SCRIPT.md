# Loom Video Presentation Script & Demonstration Walkthrough

**Project**: AI-Powered E-Commerce Knowledge Graph Retrieval System  
**Estimated Duration**: 5 – 7 minutes  
**Goal**: Explain the architecture, show the code, demonstrate the live working UI, and address every required topic.

---

## 🎥 Recording Preparation Checklist

Before hitting "Record" on Loom:
1. **Neo4j**: Running on `bolt://localhost:7687` (populated with `python -m app.graph.loader`).
2. **Backend**: Running in terminal on `http://127.0.0.1:8000` (`python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`).
3. **Frontend**: Running on `http://localhost:5174/` (`npm run dev`).
4. **Browser Tabs to Open**:
   - Tab 1: `http://localhost:5174/` (Live React Application)
   - Tab 2: `http://127.0.0.1:8000/docs` (FastAPI Swagger Interactive Documentation)
   - Tab 3: Neo4j Browser `http://localhost:7474` (Optional visual verification)
5. **VS Code / IDE**: Open to the project root with the backend MVC folders (`models/`, `views/`, `controllers/`, `services/`, `repositories/`) visible in the sidebar.

---

## ⏱️ Video Timeline & Speaking Script

```
00:00 - 00:45  Section 1: Introduction & Overall Approach
00:45 - 01:45  Section 2: Knowledge Graph Structure & Entity Relationships
01:45 - 02:45  Section 3: Retrieval & Query Pipeline (Two-Stage Architecture)
02:45 - 03:30  Section 4: Anti-Hallucination & Fact Grounding Guarantee
03:30 - 04:15  Section 5: The Banana Requirement Implementation (Exact 5 Nodes)
04:15 - 05:45  Section 6: Live System Demonstration & Sample Questions
05:45 - 06:15  Section 7: Backend Tests & Conclusion
```

---

### Section 1: Introduction & Overall Approach (00:00 – 00:45)
* **Screen**: Show the frontend dashboard at `http://localhost:5174/` or root `README.md`.
* **Speaking Points**:
  > *"Hello everyone! Today I'm presenting the AI-Powered E-Commerce Knowledge Graph project.*  
  > *Our objective is to build an end-to-end e-commerce knowledge graph and a strictly grounded AI retrieval system.*  
  > *Instead of traditional vector search or ungrounded LLM completions, our approach uses an enterprise-grade two-stage Graph-RAG architecture.*  
  > *In Stage 1, user natural language is translated into a read-only Cypher query constrained by our schema.*  
  > *That query is validated and executed directly against Neo4j.*  
  > *In Stage 2, the retrieved graph records are passed to the LLM to generate a natural language response that is grounded exclusively in database facts, with zero hallucination."*

---

### Section 2: Knowledge Graph Structure & Entity Relationships (00:45 – 01:45)
* **Screen**: Switch to IDE: show `data/ecommerce.json` and `backend/app/models/schema.py` or the interactive graph viewer on the frontend.
* **Speaking Points**:
  > *"Let's examine our Knowledge Graph schema.*  
  > *The graph contains 6 core entity types:*  
  > *1. Brand with properties id and name.*  
  > *2. Product with id, name, price, and stock.*  
  > *3. Category with id and name.*  
  > *4. Vendor with id, name, and location.*  
  > *5. Customer with id, name, and email.*  
  > *6. Order with id, order_date, status, and total_amount.*  
  >  
  > *The relationships between them are clean and directional:*  
  > *`Brand -[:HAS_PRODUCT]-> Product`*  
  > *`Product -[:BELONGS_TO]-> Category`*  
  > *`Product -[:SUPPLIED_BY]-> Vendor`*  
  > *`Customer -[:PLACED]-> Order`*  
  > *`Order -[:CONTAINS {quantity: n}]-> Product`*  
  >  
  > *Our sample dataset contains exactly 20 realistic products spanning smartphones, laptops, audio, and wearables, supplied by 6 vendors across 9 brands, with 15 customers and 20 orders containing line-item quantities. All records are connected and internally consistent."*

---

### Section 3: Retrieval/Query Process & LLM Integration (01:45 – 02:45)
* **Screen**: Switch to IDE: open `backend/app/services/llm_service.py` and `backend/app/services/validator_service.py`.
* **Speaking Points**:
  > *"Here is our retrieval pipeline in the backend service layer:*  
  > *1. When a question arrives at `POST /api/ask`, `LLMService.generate_cypher_with_llm()` feeds the question alongside our strict Cypher generation prompt into GPT-4o-mini.*  
  > *2. The generated Cypher query passes through `validator_service.py`, which enforces read-only operations using AST keyword checks, blocking mutations like CREATE, MERGE, DELETE, or DROP.*  
  > *3. `retrieval_service.py` executes the validated Cypher against Neo4j via the official Python driver and converts the graph nodes and relationships into JSON-serializable records.*  
  > *4. Finally, LLM Stage 2 takes the user question and the retrieved graph JSON to craft a user-facing answer."*

---

### Section 4: How We Ensure Answers Are Based ONLY on Retrieved Data (02:45 – 03:30)
* **Screen**: Highlight `GROUNDED_ANSWER_SYSTEM_PROMPT` in `backend/app/services/llm_service.py`.
* **Speaking Points**:
  > *"A critical requirement is ensuring that the system never hallucinates outside knowledge.*  
  > *We enforce this in three ways:*  
  > *First, Stage 1 Cypher generation is bound strictly to the schema. If a user asks for information not stored in the graph—for example, 'Who is the CEO of Apple?'—the query generator produces a query evaluating to false, yielding zero records.*  
  > *Second, if retrieved graph records are empty, the Stage 2 prompt strictly requires returning: 'The requested information is not available in the knowledge graph.'*  
  > *Third, the system prompt explicitly forbids using pre-trained external knowledge. We tested this with questions about famous CEOs, and the system consistently refrains from answering."*

---

### Section 5: The Banana Requirement Implementation (03:30 – 04:15)
* **Screen**: Switch to browser `http://localhost:5174/` showing the **Banana Verification** card (5/5 PASSED) and IDE showing `backend/app/graph/loader.py` lines 170–189.
* **Speaking Points**:
  > *"Now for the mandatory banana requirement:*  
  > *The requirement specifies that the word 'banana' must exist as a node/value in the graph exactly 5 times and be retrievable.*  
  > *In `app/graph/loader.py`, we create 5 separate Keyword nodes: `BANANA_001` through `BANANA_005`, each having `value = 'banana'`.*  
  > *Notice that these are loaded independently and not mixed into product catalog data.*  
  > *When we execute:*  
  > *`MATCH (n:Keyword) WHERE n.value = 'banana' RETURN count(n)`*  
  > *Neo4j returns exactly 5.*  
  > *We have a dedicated endpoint `GET /api/banana` and a live badge on our UI confirming 5 of 5 verified."*

---

### Section 6: Live System Demonstration & Sample Questions (04:15 – 05:45)
* **Screen**: Live UI at `http://localhost:5174/`.
* **Demonstration Actions**:
  1. **Check Dashboard Stats**:
     > *"On the dashboard, we see the live metrics: 20 Products, 9 Brands, 10 Categories, 6 Vendors, 15 Customers, 20 Orders, and 5 Banana nodes."*
  2. **Run Question 1**: Click chip or type:
     `Which Samsung products are supplied by TechWorld?`
     > *"Let's click 'Retrieve & Answer'. In real-time, the system generated the Cypher query matching Brand Samsung, Product, and Vendor TechWorld. The retrieved rows return Galaxy S25, Galaxy Buds 3, and Galaxy Watch 8. And here is the grounded natural language answer."*
  3. **Run Question 2**: Type:
     `What products did Rahul Kumar order?`
     > *"Next, 'What products did Rahul Kumar order?' The generated Cypher traverses Customer to Order to Product. It retrieves Galaxy S25, Galaxy Buds 3, and Galaxy Watch 8 with their quantities."*
  4. **Run Question 3 (Grounding / Anti-Hallucination Check)**: Type:
     `Who is the CEO of Apple?`
     > *"Now let's test our anti-hallucination guardrail: 'Who is the CEO of Apple?'*  
     > *Notice the Cypher produced 0 results, and the answer immediately says: 'The requested information is not available in the knowledge graph.' No hallucination of Tim Cook occurred."*
  5. **Run Question 4**: Type:
     `How many banana values exist in the knowledge graph?`
     > *"Finally, let's ask: 'How many banana values exist in the knowledge graph?'*  
     > *The generated Cypher queries the Keyword nodes and returns exactly 5."*

---

### Section 7: Automated Tests & Conclusion (05:45 – 06:15)
* **Screen**: Switch to terminal. Run: `python -m pytest tests/ -v`.
* **Speaking Points**:
  > *"To ensure code quality and maintainability, we have a complete automated test suite with 18 unit and integration tests covering the graph schema, banana counts, security validation, API endpoints, and grounding.*  
  > *Running `pytest tests/ -v`... and all 18 tests pass with flying colors.*  
  >  
  > *In conclusion, the project delivers a complete, modular, MVC-architected Python FastAPI application with a verified 20-product Neo4j Knowledge Graph, robust retrieval, grounded LLM synthesis, and an interactive UI.*  
  > *Thank you for your time, and I look forward to your review!"*
