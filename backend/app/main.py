import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.controllers import api_router
from app.repositories.neo4j_connection import Neo4jConnection

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ecommerce-kg")


@asynccontextmanager
async def lifespan(app: FastAPI):
    conn_status = Neo4jConnection.check_connection()
    if conn_status.get("status") == "connected":
        logger.info(f"Connected to Neo4j at {settings.NEO4J_URI}")
    else:
        logger.warning(f"Neo4j connection issue: {conn_status.get('error')}")
    yield
    Neo4jConnection.close()


app = FastAPI(
    title="E-Commerce Knowledge Graph API",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "E-Commerce Knowledge Graph API is running",
        "docs": "/docs",
    }
