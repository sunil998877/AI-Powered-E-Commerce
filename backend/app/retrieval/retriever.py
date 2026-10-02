import logging
from typing import Any, Dict, List
from neo4j.graph import Node, Relationship, Path
from app.graph.connection import Neo4jConnection
from app.retrieval.validator import validate_cypher, CypherValidationError

logger = logging.getLogger(__name__)


def serialize_neo4j_value(val: Any) -> Any:
    """Convert Neo4j objects (Node, Relationship, Path, date, time) to JSON-serializable Python data."""
    if isinstance(val, Node):
        props = dict(val.items())
        return {
            "_id": val.element_id if hasattr(val, "element_id") else str(val.id),
            "_labels": list(val.labels),
            **{k: serialize_neo4j_value(v) for k, v in props.items()},
        }
    elif isinstance(val, Relationship):
        props = dict(val.items())
        return {
            "_id": val.element_id if hasattr(val, "element_id") else str(val.id),
            "_type": val.type,
            **{k: serialize_neo4j_value(v) for k, v in props.items()},
        }
    elif isinstance(val, Path):
        return {
            "nodes": [serialize_neo4j_value(n) for n in val.nodes],
            "relationships": [serialize_neo4j_value(r) for r in val.relationships],
        }
    elif isinstance(val, dict):
        return {k: serialize_neo4j_value(v) for k, v in val.items()}
    elif isinstance(val, (list, tuple, set)):
        return [serialize_neo4j_value(item) for item in val]
    elif hasattr(val, "isoformat"):
        return val.isoformat()
    return val


class GraphRetriever:
    @classmethod
    def execute_cypher(cls, cypher: str) -> List[Dict[str, Any]]:
        """
        Validates and executes a read-only Cypher query against Neo4j,
        returning JSON-serializable structured records.
        """
        is_valid, cleaned_cypher, error_msg = validate_cypher(cypher)
        if not is_valid:
            raise CypherValidationError(error_msg)

        driver = Neo4jConnection.get_driver()
        results: List[Dict[str, Any]] = []

        try:
            with driver.session() as session:
                result = session.run(cleaned_cypher)
                for record in result:
                    record_dict = {}
                    for key, val in record.items():
                        record_dict[key] = serialize_neo4j_value(val)
                    results.append(record_dict)
            return results
        except Exception as e:
            logger.error(f"Neo4j query execution error: {e} for query: {cleaned_cypher}")
            raise RuntimeError(f"Database execution error: {str(e)}")
