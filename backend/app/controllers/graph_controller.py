import logging
from fastapi import APIRouter, HTTPException
from app.repositories.neo4j_connection import Neo4jConnection
from app.models.queries import NODES_QUERY, EDGES_QUERY, ALL_ENTITIES_QUERY
from app.services.retrieval_service import GraphRetrieverService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Graph"])


@router.get("/api/graph")
def get_graph_data_controller():
    try:
        driver = Neo4jConnection.get_driver()
        nodes = []
        links = []
        node_id_map = {}

        with driver.session() as session:
            nodes_res = session.run(NODES_QUERY)
            for r in nodes_res:
                props = dict(r["props"])
                node_type = r["type"] or "Entity"
                biz_id = props.get("id") or str(r["eid"])
                display_label = props.get("name") or props.get("value") or biz_id

                nodes.append({
                    "id": biz_id,
                    "label": display_label,
                    "type": node_type,
                    "properties": props,
                })
                node_id_map[str(r["eid"])] = biz_id
                if "id" in props:
                    node_id_map[str(props["id"])] = biz_id

            edges_res = session.run(EDGES_QUERY)
            for r in edges_res:
                src = r["source_id"] or node_id_map.get(str(r["source_eid"]), str(r["source_eid"]))
                tgt = r["target_id"] or node_id_map.get(str(r["target_eid"]), str(r["target_eid"]))
                links.append({
                    "id": str(r["rel_id"]),
                    "source": src,
                    "target": tgt,
                    "type": r["rel_type"],
                })

        return {
            "nodes": nodes,
            "links": links,
        }
    except Exception as e:
        logger.error(f"Failed to fetch graph data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/entities")
def get_entities_controller():
    try:
        results = GraphRetrieverService.execute_cypher(ALL_ENTITIES_QUERY)
        grouped = {}
        for row in results:
            labels = row.get("labels", [])
            label = labels[0] if labels else "Other"
            if label not in grouped:
                grouped[label] = []
            grouped[label].append(row)
        return grouped
    except Exception as e:
        logger.error(f"Failed to fetch entities: {e}")
        raise HTTPException(status_code=500, detail=str(e))
