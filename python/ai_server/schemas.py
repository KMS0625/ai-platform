from datetime import datetime, timezone
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class SimilarityRequest(BaseModel):
    model_config = ConfigDict(strict=True)

    source: str
    noteId: UUID | None = Field(strict=False)


class PageResponse(BaseModel):
    id: str
    noteId: str
    title: str
    content: str
    keywords: list[str]
    priority: int
    importance: int
    enabled: bool
    order: int
    createdAt: datetime

    @field_serializer("createdAt")
    def serialize_created_at(self, value: datetime) -> str:
        # Prisma's PostgreSQL timestamp columns store UTC without a timezone.
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()


class PageSimilarity(BaseModel):
    page: PageResponse
    score: float = Field(ge=-100, le=100)


class SimilarityResponse(BaseModel):
    items: list[PageSimilarity]


class KeywordRequest(BaseModel):
    model_config = ConfigDict(strict=True)

    source: str = Field(max_length=20000)
    top_k: int = Field(default=5, ge=1, le=100)


class KeywordScore(BaseModel):
    keyword: str
    textrank: float = Field(ge=0, le=1)
    semantic: float = Field(ge=0, le=1)
    score: float = Field(ge=0, le=1)


class KeywordResponse(BaseModel):
    items: list[KeywordScore]
