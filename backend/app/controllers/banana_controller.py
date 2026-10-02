import logging
from typing import List
from fastapi import APIRouter, HTTPException
from app.views.schemas import BananaNodeView
from app.services.retrieval_service import GraphRetrieverService
from app.models.queries import BANANA_NODES_QUERY

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Banana"])


@router.get("/api/banana", response_model=List[BananaNodeView])
def get_banana_nodes():
    try:
        results = GraphRetrieverService.execute_cypher(BANANA_NODES_QUERY)
        return [BananaNodeView(id=r["id"], value=r["value"]) for r in results]
    except Exception as e:
        logger.error(f"Failed to fetch banana nodes: {e}")
        raise HTTPException(status_code=500, detail=str(e))
