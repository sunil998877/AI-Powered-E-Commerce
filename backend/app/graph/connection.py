import logging
from typing import Optional, Generator
from neo4j import GraphDatabase, Driver, Session
from app.config import settings

logger = logging.getLogger(__name__)

class Neo4jConnection:
    _driver: Optional[Driver] = None

    @classmethod
    def get_driver(cls) -> Driver:
        if cls._driver is None:
            try:
                cls._driver = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
                    max_connection_lifetime=3600,
                    max_connection_pool_size=50,
                    connection_acquisition_timeout=10,
                )
                logger.info(f"Connected to Neo4j at {settings.NEO4J_URI}")
            except Exception as e:
                logger.error(f"Failed to create Neo4j driver: {e}")
                raise
        return cls._driver

    @classmethod
    def close(cls):
        if cls._driver is not None:
            cls._driver.close()
            cls._driver = None
            logger.info("Neo4j driver connection closed.")

    @classmethod
    def verify_connectivity(cls) -> bool:
        try:
            driver = cls.get_driver()
            driver.verify_connectivity()
            return True
        except Exception as e:
            logger.warning(f"Neo4j connectivity check failed: {e}")
            return False

    @classmethod
    def check_connection(cls) -> dict:
        try:
            driver = cls.get_driver()
            driver.verify_connectivity()
            return {
                "status": "connected",
                "uri": settings.NEO4J_URI,
                "database": "neo4j",
            }
        except Exception as e:
            logger.warning(f"Neo4j connectivity check failed: {e}")
            return {
                "status": "disconnected",
                "error": str(e),
                "uri": settings.NEO4J_URI,
            }

    @classmethod
    def get_session(cls, database: Optional[str] = None) -> Session:
        return cls.get_driver().session(database=database)

def get_session() -> Generator[Session, None, None]:
    driver = Neo4jConnection.get_driver()
    session = driver.session()
    try:
        yield session
    finally:
        session.close()

# Alias for dependency injection
get_db_session = get_session
