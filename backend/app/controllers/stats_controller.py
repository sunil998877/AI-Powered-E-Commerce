import logging
from fastapi import APIRouter, HTTPException
from app.views.schemas import StatsResponseView
from app.repositories.neo4j_connection import Neo4jConnection
from app.models.queries import STATS_QUERY

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Statistics"])


@router.get("/api/stats", response_model=StatsResponseView)
def get_graph_stats_controller():
    """
    MVC Controller: Retrieves Knowledge Graph node and entity counts from Neo4j.
    """
    try:
        driver = Neo4jConnection.get_driver()
        with driver.session() as session:
            record = session.run(STATS_QUERY).single()
            if record:
                s = record.get("stats") or {}
                return StatsResponseView(
                    products=s.get("products", 0),
                    brands=s.get("brands", 0),
                    categories=s.get("categories", 0),
                    vendors=s.get("vendors", 0),
                    customers=s.get("customers", 0),
                    orders=s.get("orders", 0),
                    banana=s.get("banana", 0),
                )
        return StatsResponseView(products=0, brands=0, categories=0, vendors=0, customers=0, orders=0, banana=0)
    except Exception as e:
        logger.error(f"Failed to fetch stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
