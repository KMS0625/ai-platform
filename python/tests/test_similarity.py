import unittest
from datetime import datetime
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient

from ai_server.main import create_app
from ai_server.repository import PageRepository
from ai_server.schemas import PageResponse, SimilarityRequest
from ai_server.service import SimilarityService

NOTE_ID = "11111111-1111-4111-8111-111111111111"


def page(index, content):
    return PageResponse(
        id=f"33333333-3333-4333-8333-{index:012d}", noteId=NOTE_ID,
        title=f"page {index}", content=content, keywords=["keyword"],
        priority=10, importance=20, enabled=index != 2, order=index * 10,
        createdAt=datetime(2026, 11, 10),
    )


class FakePages:
    def __init__(self, pages):
        self.pages = pages
        self.calls = []

    def find_by_note_id(self, note_id):
        self.calls.append(note_id)
        return self.pages


class FakeEncoder:
    def __init__(self):
        self.calls = []

    def encode(self, sentences, **options):
        self.calls.append((sentences, options))
        return np.array([[1, 0], [1, 0], [0, 1], [-1, 0]], dtype=np.float32)


class SimilarityTests(unittest.TestCase):
    def test_queries_note_and_pairs_each_page_with_its_score(self):
        model = FakeEncoder()
        pages = FakePages([page(1, "same"), page(2, "other"), page(3, "opposite")])
        result = SimilarityService(model, pages).calculate(
            SimilarityRequest(source="source", noteId=NOTE_ID)
        )
        self.assertEqual([item.score for item in result.items], [100.0, 0.0, -100.0])
        self.assertEqual([item.page for item in result.items], pages.pages)
        self.assertEqual(pages.calls, [NOTE_ID])
        self.assertEqual(model.calls[0][0], ["source", "same", "other", "opposite"])
        self.assertTrue(model.calls[0][1]["normalize_embeddings"])
        # All pages are compared; disabled pages retain their enabled flag.
        self.assertFalse(result.items[1].page.enabled)
        self.assertEqual(result.model_dump(mode="json")["items"][0]["page"]["createdAt"], "2026-11-10T00:00:00+00:00")

    def test_null_note_skips_both_database_and_encoding(self):
        model = FakeEncoder()
        pages = FakePages([page(1, "unused")])
        result = SimilarityService(model, pages).calculate(SimilarityRequest(source="s", noteId=None))
        self.assertEqual(result.items, [])
        self.assertEqual(pages.calls, [])
        self.assertEqual(model.calls, [])

    def test_no_pages_skips_encoding(self):
        model = FakeEncoder()
        result = SimilarityService(model, FakePages([])).calculate(SimilarityRequest(source="s", noteId=NOTE_ID))
        self.assertEqual(result.items, [])
        self.assertEqual(model.calls, [])

    def test_percentage_is_rounded_to_two_decimal_places(self):
        class RoundingEncoder:
            def encode(self, sentences, **options):
                return np.array([[1, 0], [0.123456, 0.99235]], dtype=np.float32)

        result = SimilarityService(RoundingEncoder(), FakePages([page(1, "t")])).calculate(
            SimilarityRequest(source="s", noteId=NOTE_ID)
        )
        self.assertEqual(result.items[0].score, 12.35)

    def test_route_reuses_service_and_validates_request(self):
        model = FakeEncoder()
        pages = FakePages([page(1, "same"), page(2, "other"), page(3, "opposite")])
        starts = []

        def factory():
            starts.append(True)
            return SimilarityService(model, pages)

        app = create_app(factory)
        with TestClient(app) as client:
            for _ in range(2):
                response = client.post("/similarity", json={"source": "source", "noteId": NOTE_ID})
                self.assertEqual(response.status_code, 200)
                items = response.json()["items"]
                self.assertEqual([item["score"] for item in items], [100.0, 0.0, -100.0])
                self.assertEqual(items[0]["page"]["content"], "same")
            self.assertEqual(client.post("/similarity", json={"source": "s", "noteId": None}).json(), {"items": []})
            for body in [{}, {"source": 1, "noteId": NOTE_ID}, {"source": "s", "noteId": "invalid"}]:
                self.assertEqual(client.post("/similarity", json=body).status_code, 422)

        self.assertEqual(starts, [True])
        self.assertEqual(len(model.calls), 2)
        self.assertFalse(hasattr(app.state, "similarity_service"))

    @patch("similarity_server.repository.psycopg.connect")
    def test_repository_parameterizes_note_id_and_returns_page_metadata(self, connect):
        connection = connect.return_value.__enter__.return_value
        row = page(1, "content").model_dump()
        connection.execute.return_value.fetchall.return_value = [row]
        pages = PageRepository("postgresql://test@localhost/test").find_by_note_id(NOTE_ID)
        query, parameters = connection.execute.call_args.args
        self.assertIn('WHERE "noteId" = %s', query)
        self.assertIn('ORDER BY "order" ASC', query)
        self.assertEqual(parameters, (NOTE_ID,))
        self.assertEqual(pages[0].content, "content")
        connect.return_value.__exit__.assert_called_once()

    @patch("similarity_server.repository.psycopg.connect")
    def test_repository_handles_prisma_schema_url_option(self, connect):
        connection = connect.return_value.__enter__.return_value
        connection.execute.return_value.fetchall.return_value = []
        PageRepository("postgresql://test@localhost/test?schema=custom&sslmode=require").find_by_note_id(NOTE_ID)
        self.assertNotIn("schema=", connect.call_args.args[0])
        self.assertIn("sslmode=require", connect.call_args.args[0])
        self.assertEqual(connection.execute.call_args_list[0].args[0].as_string(), 'SET search_path TO "custom"')


if __name__ == "__main__":
    unittest.main()
