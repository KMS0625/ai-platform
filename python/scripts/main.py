
import math
from functools import lru_cache

import networkx as nx
from kiwipiepy import Kiwi
from sentence_transformers import SentenceTransformer


MODEL_NAME = (
    "sentence-transformers/"
    "paraphrase-multilingual-MiniLM-L12-v2"
)

# 일반 명사 고유 명사
NOUN_TAGS = {"NNG", "NNP", "SL"}


# kiwi 모델 로드
@lru_cache(maxsize=1)
def load_kiwi() -> Kiwi:
    return Kiwi()

# bert 모델 로드
@lru_cache(maxsize=1)
def load_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


# 명사 및 영어 추출
@lru_cache(maxsize=1)
def load_kiwi() -> Kiwi:
    return Kiwi()


def analyze_nouns(source: str) -> list[list[str]]:
    kiwi = load_kiwi()
    results = []

    for sentence in kiwi.split_into_sents(source):
        text = sentence.text
        nouns = []

        start = None
        end = None

        for token in kiwi.tokenize(text):

            if token.tag in NOUN_TAGS:

                # 첫 번째 명사
                if start is None:
                    start = token.start
                    end = token.end

                # 띄어쓰기 없이 연결된 명사
                elif token.start == end:
                    end = token.end

                # 띄어쓰기 있는 새로운 명사
                else:
                    nouns.append(text[start:end])

                    start = token.start
                    end = token.end

            else:
                # 명사가 아닌 형태소가 나오면 결합 종료
                if start is not None:
                    nouns.append(text[start:end])
                    start = None
                    end = None

        # 마지막 명사 처리
        if start is not None:
            nouns.append(text[start:end])

        if nouns:
            results.append(nouns)

    return results


# 3. TextRank 계산
def calculate_textrank(
    sentences: list[list[str]],
    window_size: int = 4,
) -> dict[str, float]:

    if window_size < 2:
        raise ValueError("window_size는 2 이상이어야 합니다.")

    graph = nx.Graph()

    for nouns in sentences:
        graph.add_nodes_from(nouns)

        for i, word in enumerate(nouns):
            end = min(i + window_size, len(nouns))

            for j in range(i + 1, end):
                other = nouns[j]

                if word == other:
                    continue

                if graph.has_edge(word, other):
                    graph[word][other]["weight"] += 1
                else:
                    graph.add_edge(
                        word,
                        other,
                        weight=1,
                    )

    if graph.number_of_nodes() == 0:
        return {}

    return nx.pagerank(
        graph,
        alpha=0.85,
        weight="weight",
    )


# 4. MiniLM 의미 유사도 계산
def calculate_similarity(
    source: str,
    candidates: list[str],
) -> dict[str, float]:

    if not candidates:
        return {}

    model = load_model()

    # 원문과 모든 후보를 한 번에 임베딩
    embeddings = model.encode(
        [source, *candidates],
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    )

    source_vector = embeddings[0]
    candidate_vectors = embeddings[1:]

    # 정규화된 벡터의 내적 = 코사인 유사도
    similarities = candidate_vectors @ source_vector

    return {
        word: float(score)
        for word, score in zip(candidates, similarities)
    }


# 5. 최대값 기준 정규화
def normalize_scores(
    scores: dict[str, float],
) -> dict[str, float]:

    if not scores:
        return {}

    # 기하평균 계산을 위해 음수는 0으로 처리
    positive_scores = {
        word: max(0.0, score)
        for word, score in scores.items()
    }

    max_score = max(positive_scores.values())

    if max_score == 0:
        return {
            word: 0.0
            for word in scores
        }

    return {
        word: score / max_score
        for word, score in positive_scores.items()
    }


# 6. 최종 점수 결합
def extract_keywords(
    source: str,
    top_k: int = 50,
) -> list[dict]:

    # 형태소 분석
    sentences = analyze_nouns(source)

    # TextRank
    textrank_scores = calculate_textrank(sentences)

    if not textrank_scores:
        return []

    # 중복을 제거한 키워드 후보
    candidates = list(textrank_scores.keys())

    # MiniLM 의미 유사도
    semantic_scores = calculate_similarity(
        source,
        candidates,
    )

    # 각각 정규화
    textrank_norm = normalize_scores(textrank_scores)
    semantic_norm = normalize_scores(semantic_scores)

    results = []

    for word in candidates:
        t = textrank_norm[word]
        s = semantic_norm[word]

        # 두 점수의 기하평균
        final_score = math.sqrt(t * s)

        results.append({
            "keyword": word,
            "textrank": t,
            "semantic": s,
            "score": final_score,
        })

    # 최종 점수 내림차순 정렬
    results.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return results[:top_k]


def main():
    source = """
    자연어 처리 기술은 인공지능의 중요한 분야이다.
    자연어 처리 모델은 문장의 의미를 분석한다.
    인공지능 모델을 이용하면 문서에서 키워드를 추출할 수 있다.
    키워드 추출은 문서 검색과 정보 분석에 활용된다.
    """

    keywords = extract_keywords(source, top_k=50)

    for item in keywords:
        print(
            f"{item['keyword']:10s} "
            f"TextRank: {item['textrank']:.4f} "
            f"MiniLM: {item['semantic']:.4f} "
            f"Final: {item['score']:.4f}"
        )


if __name__ == "__main__":
    main()
