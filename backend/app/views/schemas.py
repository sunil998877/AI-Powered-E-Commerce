from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AskRequestView(BaseModel):
    question: str = Field(..., min_length=1)


class AskResponseView(BaseModel):
    question: str
    cypher: str
    results: List[Dict[str, Any]]
    answer: str
    grounded: bool = True
    result_count: int


class BananaNodeView(BaseModel):
    id: str
    value: str


class StatsResponseView(BaseModel):
    products: int
    brands: int
    categories: int
    vendors: int
    customers: int
    orders: int
    banana: int


class GraphNodeView(BaseModel):
    id: str
    label: str
    type: str
    properties: Dict[str, Any]


class GraphLinkView(BaseModel):
    id: str
    source: str
    target: str
    type: str


class GraphVisualizationView(BaseModel):
    nodes: List[GraphNodeView]
    links: List[GraphLinkView]


class HealthStatusView(BaseModel):
    status: str
    uri: Optional[str] = None
    database: Optional[str] = None
    error: Optional[str] = None
