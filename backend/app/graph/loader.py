from app.repositories.graph_loader import (
    load_ecommerce_dataset,
    create_constraints_and_indexes,
)
from app.repositories.neo4j_connection import Neo4jConnection

if __name__ == "__main__":
    try:
        load_ecommerce_dataset()
    finally:
        Neo4jConnection.close()
