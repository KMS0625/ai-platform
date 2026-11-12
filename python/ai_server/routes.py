from fastapi import APIRouter, Request

from .schemas import SimilarityRequest, SimilarityResponse, KeywordRequest, KeywordResponse
from .service import SimilarityService

router = APIRouter()


@router.post("/ai_server", response_model=SimilarityResponse)
@router.post("/similarity", response_model=SimilarityResponse)
def similarity(data: SimilarityRequest, request: Request) -> SimilarityResponse:
    service: SimilarityService = request.app.state.similarity_service
    return service.calculate(data)


@router.post("/keywords", response_model=KeywordResponse)
def keywords(data: KeywordRequest) -> KeywordResponse:
    from .keyword_service import extract_keywords

    return KeywordResponse(items=extract_keywords(data.source, data.top_k))
