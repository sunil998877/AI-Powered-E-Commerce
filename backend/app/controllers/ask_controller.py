import logging
from fastapi import APIRouter, HTTPException, status
from app.views.schemas import AskRequestView, AskResponseView
from app.services.llm_service import LLMService
from app.services.retrieval_service import GraphRetrieverService
from app.services.validator_service import CypherValidationError

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Ask AI Pipeline"])


@router.post("/api/ask", response_model=AskResponseView)
def ask_question_controller(req: AskRequestView):
    """
    MVC Controller: Accepts user question, invokes LLM to generate Cypher,
    executes against Neo4j, and returns grounded answer view.
    """
    question = req.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    try:
        # Step 1: Stage 1 LLM Service converts Natural Language to Cypher
        cypher = LLMService.generate_cypher_with_llm(question)

        # Step 2: Retrieval Service validates and executes query against Neo4j
        results = GraphRetrieverService.execute_cypher(cypher)

        # Step 3: Stage 2 LLM Service synthesizes grounded answer
        answer = LLMService.generate_grounded_answer(question, results)

        # Step 4: Return View Schema
        return AskResponseView(
            question=question,
            cypher=cypher,
            results=results,
            answer=answer,
            grounded=True,
            result_count=len(results),
        )
    except CypherValidationError as cve:
        logger.warning(f"Cypher safety validation rejected query: {cve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query safety validation error: {str(cve)}",
        )
    except Exception as e:
        logger.error(f"Error processing question '{question}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing graph retrieval pipeline: {str(e)}",
        )
