from threading import Lock
from typing import Protocol

import numpy as np
from numpy.typing import NDArray

from .schemas import PageResponse, PageSimilarity, SimilarityRequest, SimilarityResponse


class PageReader(Protocol):
    def find_by_note_id(self, note_id: str) -> list[PageResponse]: ...


class SentenceEncoder(Protocol):
    def encode(
        self,
        sentences: list[str],
        *,
        normalize_embeddings: bool,
        convert_to_numpy: bool,
    ) -> NDArray[np.float32]: ...


class SimilarityService:
    def __init__(self, model: SentenceEncoder, pages: PageReader) -> None:
        self._model = model
        self._pages = pages
        self._lock = Lock()

    def calculate(self, data: SimilarityRequest) -> SimilarityResponse:
        if data.noteId is None:
            return SimilarityResponse(items=[])

        pages = self._pages.find_by_note_id(str(data.noteId))
        if not pages:
            return SimilarityResponse(items=[])

        # Reuse a single model, including when sync routes run in worker threads.
        with self._lock:
            embeddings = self._model.encode(
                [data.source, *(page.content for page in pages)],
                normalize_embeddings=True,
                convert_to_numpy=True,
            )

        similarities = np.dot(embeddings[1:], embeddings[0])
        return SimilarityResponse(
            items=[
                PageSimilarity(page=page, score=round(float(score) * 100, 2))
                for page, score in zip(pages, similarities, strict=True)
            ]
        )

class extractionKeywordService:
    def __init__(self, model: SentenceEncoder, source: str) -> None:
            self._model = model
            self._pages = pages
            self._lock = Lock()