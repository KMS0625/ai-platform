
from collections.abc import Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .model import load_model
from .routes import router
from .service import SimilarityService
from .config import get_database_url
from .repository import PageRepository


# 유사도 계산에 사용할 서비스 객체 생성
def create_service() -> SimilarityService:
    pages = PageRepository(get_database_url())
    # AI 모델을 불러와 SimilarityService에 전달
    return SimilarityService(load_model(), pages)


# FastAPI 애플리케이션을 생성하는 함수
# service_factory는 서비스 객체를 생성할 함수
def create_app(
    service_factory: Callable[[], SimilarityService] = create_service,
) -> FastAPI:

    # FastAPI 서버의 시작과 종료 시 실행할 작업 정의
    @asynccontextmanager
    async def lifespan(app: FastAPI):

        # 서버 시작 시 서비스 객체 생성
        # 생성된 객체를 app.state에 저장해 API 요청 간 공유
        app.state.similarity_service = service_factory()

        try:
            # 서버가 요청을 처리하는 구간
            # yield 이전은 시작 작업, 이후는 종료 작업
            yield

        finally:
            # 서버 종료 시 저장된 서비스 참조 제거
            # 모델 객체의 실제 메모리 해제를 보장하는 것은 아님
            del app.state.similarity_service

    # FastAPI 앱 생성 및 서버 생명주기 함수 등록
    app = FastAPI(
        title="Similarity API",
        lifespan=lifespan
    )

    # routes.py에 정의된 API 엔드포인트 등록
    app.include_router(router)

    # 생성된 FastAPI 앱 반환
    return app


# 실제 서버에서 사용할 FastAPI 앱 객체 생성
# 이 시점에는 create_app()만 실행되며,
# 모델은 서버의 lifespan 시작 시 로딩됨
app = create_app()
