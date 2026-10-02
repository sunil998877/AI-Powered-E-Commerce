import logging
from fastapi import APIRouter, HTTPException, status
from app.views.schemas import AskRequestView, AskResponseView
from app.services.llm_service import LLMService
from app.services.retrieval_service import GraphRetrieverService
from app.services.validator_service import CypherValidationError

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Ask"])


@router.post("/api/ask", response_model=AskResponseView)
def ask_question_controller(req: AskRequestView):
    question = req.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    try:
        cypher = LLMService.generate_cypher_with_llm(question)
        results = GraphRetrieverService.execute_cypher(cypher)
        answer = LLMService.generate_grounded_answer(question, results)

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
