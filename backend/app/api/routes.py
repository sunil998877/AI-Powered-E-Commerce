"""
MVC Routes Bridge:
Connects the Controllers, Views, Models, and Services together.
"""
from app.controllers import api_router as router
from app.views.schemas import (
    AskRequestView as AskRequest,
    AskResponseView as AskResponse,
    BananaNodeView as BananaNode,
    StatsResponseView as StatsResponse,
)

__all__ = [
    "router",
    "AskRequest",
    "AskResponse",
    "BananaNode",
    "StatsResponse",
]
