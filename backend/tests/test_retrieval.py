import pytest
from app.llm.service import LLMService
from app.retrieval.retriever import GraphRetriever
from app.retrieval.validator import validate_cypher, CypherValidationError


def test_cypher_validator_blocks_mutations():
    unsafe_queries = [
        "CREATE (n:Product {name: 'Fake'}) RETURN n",
        "MATCH (p:Product) DELETE p",
        "MATCH (n) DETACH DELETE n",
        "MATCH (p:Product) SET p.price = 0 RETURN p",
        "MERGE (b:Brand {name: 'NewBrand'}) RETURN b",
        "DROP CONSTRAINT brand_id_unique",
        "CALL apoc.periodic.iterate()",
    ]
    for q in unsafe_queries:
        is_valid, _, err = validate_cypher(q)
        assert not is_valid, f"Validator should have rejected unsafe query: '{q}'"
        assert "forbidden" in err.lower() or "validation failed" in err.lower()


def test_cypher_validator_allows_readonly_queries():
    safe_queries = [
        "MATCH (b:Brand)-[:HAS_PRODUCT]->(p:Product) RETURN b.name, p.name",
        "MATCH (k:Keyword) WHERE k.value = 'banana' RETURN count(k) AS banana_count",
        "MATCH (c:Customer)-[:PLACED]->(o:Order) RETURN c.name, o.id",
    ]
    for q in safe_queries:
        is_valid, cleaned, err = validate_cypher(q)
        assert is_valid, f"Validator rejected valid query '{q}' with error: {err}"
        assert cleaned is not None


def test_natural_language_to_cypher_and_retrieval():
    question = "Which Samsung products are supplied by TechWorld?"
    cypher = LLMService.generate_cypher_with_llm(question)
    assert cypher, "Generated Cypher should not be empty"

    results = GraphRetriever.execute_cypher(cypher)
    assert isinstance(results, list)
    assert len(results) > 0, "Should retrieve at least one Samsung product supplied by TechWorld"

    product_names = [
        str(r.get("name") or r.get("product") or r.get("product_name") or list(r.values())[0]).lower()
        for r in results
    ]
    # In our dataset: Galaxy S25, Galaxy Buds 3, Galaxy Watch 8
    assert any("galaxy s25" in name for name in product_names)
    assert any("galaxy buds" in name for name in product_names)

    answer = LLMService.generate_grounded_answer(question, results)
    assert "Galaxy S25" in answer or "galaxy s25" in answer.lower()


def test_unknown_information_grounding_prevents_hallucination():
    """System must NOT answer using outside general knowledge when information is not in the graph."""
    unknown_question = "Who is the CEO of Apple?"
    cypher = LLMService.generate_cypher_with_llm(unknown_question)
    results = GraphRetriever.execute_cypher(cypher)

    # Graph does not store CEOs
    assert len(results) == 0, f"Expected 0 results for unknown question, got {results}"

    answer = LLMService.generate_grounded_answer(unknown_question, results)
    assert "The requested information is not available in the knowledge graph." in answer
    assert "Tim Cook" not in answer, "Must not hallucinate Tim Cook from external knowledge!"
