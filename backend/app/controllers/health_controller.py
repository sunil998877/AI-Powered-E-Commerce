from fastapi import APIRouter
from app.repositories.neo4j_connection import Neo4jConnection

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check_controller():
    """MVC Controller: Verifies backend application health."""
    return {"status": "ok"}


@router.get("/health/neo4j")
def neo4j_health_check_controller():
    """MVC Controller: Verifies Neo4j database connectivity."""
    health = Neo4jConnection.check_connection()
    if health.get("status") != "connected":
        return {"status": "disconnected", "error": health.get("error"), "uri": health.get("uri")}
    return health
