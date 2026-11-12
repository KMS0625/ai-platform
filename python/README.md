# AI 서버: 문장 유사도와 키워드 추출

키워드는 브라우저 → `POST /api/keywords` (Next.js) → `POST /keywords` (FastAPI) 순서로 추출합니다. 기존 Python 패키지 이름 `ai_server`를 그대로 사용합니다.

```ts
import { keywordApi } from "@/api/keywords/keywordApi";

const { items } = await keywordApi.extract({
    source: "자연어 처리 모델은 문서에서 키워드를 추출한다.",
    top_k: 10,
});
// items: [{ keyword, textrank, semantic, score }, ...]
```

`source`는 최대 20,000자, `top_k`는 1~100의 정수이며 생략하면 5입니다. 공백뿐인 입력이나 명사 후보가 없는 입력은 빈 items를 반환합니다. Kiwi가 명사 및 영어 후보를 추출하고 TextRank와 다국어 MiniLM 유사도를 각각 최대값으로 정규화합니다. 음수 유사도는 0으로 처리하며 기존 스크립트와 동일하게 **기하평균 `sqrt(textrank * semantic)`** 으로 점수를 계산해 내림차순으로 반환합니다. 모든 점수는 0~1입니다. 산술기하평균의 반복 계산은 사용하지 않습니다.

키워드 모델은 기존 유사도 API의 캐시된 MiniLM 모델을 재사용하고 Kiwi는 최초 키워드 요청 시 로드됩니다. 최초 요청에는 추가 로딩 시간이 필요할 수 있습니다. 필요한 패키지는 아래 requirements 설치 명령으로 설치합니다.

다른 Python 서버 주소는 Next.js의 `.env.local`에 `KEYWORD_API_URL=http://127.0.0.1:8000/keywords`로 설정합니다. 브라우저에는 이 환경변수가 노출되지 않습니다. Next.js는 잘못된 입력에 400, Python의 비정상 응답에 502, 연결 실패에 503, 30초 시간 초과에 504를 반환합니다. 요청 취소도 Python HTTP 요청에 전달됩니다.

Python 3.10 이상이 필요합니다. 아래 명령은 저장소 루트의 PowerShell 기준입니다.

```powershell
py -m venv python/.venv
./python/.venv/Scripts/python.exe -m pip install -r python/requirements-dev.txt
./python/.venv/Scripts/python.exe -m uvicorn ai_server.main:app --app-dir python --host 127.0.0.1 --port 8000
```

처음 시작할 때 `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` 모델을 다운로드합니다. 모델 로드가 끝나야 서버가 요청을 받습니다. FastAPI lifespan에서 프로세스당 모델을 한 번 로드합니다. 여러 worker를 사용하면 worker마다 별도로 모델을 로드합니다.

Linux/macOS에서는 `python3 -m venv python/.venv`와 `python/.venv/bin/python`을 사용합니다.

다른 터미널에서 Next.js를 실행합니다.

```powershell
npm run dev
```

Next.js는 기본적으로 `http://127.0.0.1:8000/similarity`를 호출합니다. 다른 서버를 사용할 때는 루트 `.env.local`에 **전체 엔드포인트 주소**를 지정하고 Next.js를 재시작하세요.

```dotenv
SIMILARITY_API_URL=http://127.0.0.1:8000/similarity
```

이 변수는 서버에서만 사용합니다. 브라우저는 같은 출처의 `POST /api/similarity`를 사용하므로 Python에 브라우저용 CORS 설정은 필요하지 않습니다.

Python도 Next.js와 같은 PostgreSQL DB에 접속합니다. `DATABASE_URL`은 프로세스 환경변수 → 저장소 루트 `.env.local` → `.env` 순서로 읽습니다. Python을 별도 서버에서 실행한다면 해당 서버에도 `DATABASE_URL`을 설정하세요. Prisma URL의 `?schema=...` 옵션도 처리합니다. 새 의존성 `psycopg[binary]`, `python-dotenv`가 추가되었으므로 requirements를 다시 설치해야 합니다.

```ts
import { similarityApi } from "@/api/similarity/similarityApi";

const { items } = await similarityApi.calculate({
    source: "오늘 날씨가 좋아요",
    noteId: context.noteId, // 현재 채팅에 연결된 노트 UUID 또는 null
});
// items: [{ page: { id, noteId, title, content, ... }, score: 83.21 }, ...]
```

현재 채팅의 컨텍스트에서는 `chatWorkspace.compareNotePages(source, signal?)`도 제공하므로 noteId를 직접 꺼내지 않아도 됩니다. 이 함수는 현재 채팅에 연결된 noteId를 사용하며, 다른 채팅으로 이동해 컨텍스트를 로딩하는 동안은 이전 채팅의 noteId를 사용하지 않습니다.

서버 코드에서는 `similarityService.calculate(data, signal?)`을 직접 사용할 수도 있습니다. 브라우저의 요청 취소는 Next.js의 Python HTTP 요청에도 전달됩니다. 이미 실행 중인 Python 모델 연산을 중단하는 것은 아닙니다.

요청은 `{ source: string, noteId: string | null }`, 응답은 `{ items: [{ page, score }] }`입니다. 비교 기준인 source는 계속 필요하고, targets는 보내지 않습니다. FastAPI가 noteId로 Page 테이블을 조회한 뒤 각 페이지의 content를 사용합니다. 모든 페이지를 비교하며, enabled가 false인 페이지도 반환 정보에 포함됩니다. 조회 순서는 order → createdAt → id 오름차순이며 결과를 점수순으로 다시 정렬하거나 필터링하지 않습니다.

noteId가 null이면 클라이언트에서 fetch 자체를 생략하고 `{ items: [] }`를 반환합니다. Next.js 서비스와 Python 서비스에도 같은 방어 처리가 있어 DB 조회와 임베딩 계산을 건너뜁니다. 노트에 페이지가 없으면 임베딩 계산을 생략합니다.

page에는 id, noteId, title, content, keywords, priority, importance, enabled, order, createdAt을 담습니다. 날짜는 UTC 기준 ISO 문자열로 전달합니다. 점수는 정규화된 임베딩의 내적 × 100을 소수 둘째 자리로 반올림한 값이며, 확률이 아니므로 음수가 나올 수 있습니다. 원문은 trim하지 않습니다.

Next.js 오류 응답:

| HTTP | error | 의미 |
| --- | --- | --- |
| 400 | INVALID_INPUT / INVALID_JSON | 잘못된 사용자 요청 |
| 502 | SIMILARITY_UPSTREAM_ERROR | Python 서버의 비정상 HTTP 응답 |
| 502 | INVALID_SIMILARITY_RESPONSE | 페이지·점수 형태 오류, 다른 노트의 페이지 또는 중복 페이지 |
| 503 | SIMILARITY_UNAVAILABLE | Python 서버 연결 실패 |
| 504 | SIMILARITY_TIMEOUT | Python 요청 30초 초과 |



구조:

- `ai_server/schemas.py`: Pydantic 요청·응답 DTO
- `ai_server/model.py`: SentenceTransformer 생성
- `ai_server/config.py`: DB 환경설정
- `ai_server/repository.py`: noteId로 페이지 조회
- `ai_server/service.py`: 유사도 계산
- `ai_server/routes.py`: FastAPI 라우트
- `ai_server/main.py`: 앱 구성과 모델 수명주기

참고: [FastAPI lifespan](https://fastapi.tiangolo.com/advanced/events/), [SentenceTransformer encode](https://www.sbert.net/docs/package_reference/sentence_transformer/model.html).
