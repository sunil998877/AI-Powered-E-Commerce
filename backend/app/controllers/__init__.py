from fastapi import APIRouter
from app.controllers.ask_controller import router as ask_router
from app.controllers.stats_controller import router as stats_router
from app.controllers.banana_controller import router as banana_router
from app.controllers.graph_controller import router as graph_router
from app.controllers.health_controller import router as health_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(ask_router)
api_router.include_router(stats_router)
api_router.include_router(banana_router)
api_router.include_router(graph_router)

__all__ = [
    "api_router",
    "ask_router",
    "stats_router",
    "banana_router",
    "graph_router",
    "health_router",
]
