import math
import unittest
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient

from ai_server.keyword_service import extract_keywords, analyze_nouns
from ai_server.main import create_app


class KeywordTests(unittest.TestCase):
    def test_korean_nouns(self):
        words = sum(analyze_nouns("인공지능 모델은 문서에서 키워드를 추출한다."), [])
        self.assertIn("인공지능", words)
        self.assertIn("키워드", words)

    def test_scores_and_sorting_with_fake_embeddings(self):
        class Encoder:
            def encode(self, sentences, **kwargs):
                return np.array([[1., 0.], [.25, .968], [1., 0.], [-1., 0.]])

        with patch("ai_server.keyword_service.analyze_nouns", return_value=[["a", "b", "c"]]), patch(
            "ai_server.keyword_service.load_model", return_value=Encoder()
        ):
            items = extract_keywords("source", 2)
        self.assertEqual([item["keyword"] for item in items], ["b", "a"])
        for item in items:
            self.assertAlmostEqual(item["score"], math.sqrt(item["textrank"] * item["semantic"]))

    def test_empty_input_skips_model(self):
        with patch("ai_server.keyword_service.load_model") as model:
            self.assertEqual(extract_keywords("  "), [])
            with patch("ai_server.keyword_service.analyze_nouns", return_value=[]):
                self.assertEqual(extract_keywords("!"), [])
            model.assert_not_called()

    def test_keyword_route_and_validation(self):
        with TestClient(create_app(lambda: object())) as client:
            self.assertEqual(client.post("/keywords", json={"source": " "}).json(), {"items": []})
            for body in [{}, {"source": 3}, {"source": "s", "top_k": 0},
                         {"source": "s", "top_k": 101}, {"source": "s", "top_k": True},
                         {"source": "s" * 20001}]:
                self.assertEqual(client.post("/keywords", json=body).status_code, 422)


if __name__ == "__main__":
    unittest.main()
