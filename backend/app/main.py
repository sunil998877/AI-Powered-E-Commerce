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
    logger.info("Initializing E-Commerce AI Knowledge Graph Backend (MVC Architecture)...")
    conn_status = Neo4jConnection.check_connection()
    if conn_status.get("status") == "connected":
        logger.info(f"Neo4j database connection established successfully at {settings.NEO4J_URI}.")
    else:
        logger.warning(f"Neo4j connection warning: {conn_status.get('error')}")
    yield
    logger.info("Shutting down E-Commerce AI Knowledge Graph Backend...")
    Neo4jConnection.close()


app = FastAPI(
    title="E-Commerce AI Knowledge Graph API (MVC)",
    description="Production-grade AI Knowledge Graph retrieval system integrating Neo4j and LLMs built with MVC Architecture",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware
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

# Mount the unified MVC Controller Router
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "AI-Powered E-Commerce Knowledge Graph API is running (MVC Architecture).",
        "docs": "/docs",
        "health": "/health",
        "neo4j": "/health/neo4j",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
