from fastapi import APIRouter, Request

from .schemas import SimilarityRequest, SimilarityResponse
from .service import SimilarityService

router = APIRouter()


@router.post("/ai_server", response_model=SimilarityResponse)
def similarity(data: SimilarityRequest, request: Request) -> SimilarityResponse:
    service: SimilarityService = request.app.state.similarity_service
    return service.calculate(data)
