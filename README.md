# AI Platform

> 여러 AI 응답을 비교하고, 유용한 답변을 나만의 지식으로 축적하는 AI 워크스페이스

AI Platform은 **채팅·노트·프롬프트를 연결하는 풀스택 웹 프로젝트**입니다. 하나의 질문을 여러 스레드에 보내 응답을 비교하고, 답변을 노트 페이지로 저장합니다. 저장한 페이지는 키워드 조건에 따라 이후 질문의 문맥으로 재사용합니다.

Next.js·TypeScript로 웹과 API를 구성하고, PostgreSQL로 대화 및 지식을 관리하며, FastAPI 기반 Python 서버에서 문장 유사도와 한국어 키워드 추출을 처리합니다.

## 해결하려는 문제

AI를 활용할 때 모델별 답변을 따로 확인하거나, 유용한 답변을 다른 메모 도구에 옮기거나, 다음 질문에 배경 정보를 반복해서 입력하는 과정이 생깁니다. 이 프로젝트는 이 과정을 하나의 작업 흐름으로 연결하는 것을 목표로 합니다.

**질문 → 응답 비교 → 관련 노트 확인 → 답변을 페이지로 저장 → 다음 대화에 활용**

## 주요 기능

| 기능 | 구현 내용 |
| --- | --- |
| 여러 스레드의 응답 비교 | 같은 질문을 각 스레드에 병렬 요청하고, 도착한 응답부터 개별 반영 |
| 채팅 문맥 설정 | 채팅 워크스페이스에 노트와 프롬프트를 연결하여 재사용 |
| 노트·페이지 관리 | 제목·본문·키워드·중요도·배치 우선순위·활성 여부를 페이지 단위로 관리 |
| 답변의 지식화 | AI 답변을 바탕으로 페이지 초안을 작성하고 연결된 노트에 저장 |
| 관련 페이지 확인 | 답변과 연결된 노트 페이지의 의미 유사도를 계산해 상위 3개 페이지 확인 |
| 키워드 자동 추출 | Kiwi의 명사·영어 후보 추출, TextRank, MiniLM 의미 유사도를 조합 |
| 프롬프트 관리 | 지시문과 생성 설정을 저장하고 채팅에 연결 |
| 편집 자동 저장 | 변경 내용을 병합하고 기본 1초 디바운스로 저장 요청 처리 |

현재 외부 생성 API 연동은 **Gemini**에 구현되어 있습니다. OpenAI·Anthropic 분기는 임시 응답입니다. 등록된 Gemini 모델의 사용 가능 여부는 API 계정과 제공 상태에 따라 달라집니다.

## 사용 흐름

1. `/note`에서 노트를 만들고 배경 지식 페이지와 키워드를 작성합니다.
2. `/prompt`에서 반복 사용할 지시문과 생성 설정을 작성합니다.
3. `/chat`에서 채팅을 생성하고 노트·프롬프트를 연결합니다.
4. 비교할 모델의 스레드를 추가하고 질문을 전송합니다.
5. 답변에서 페이지 만들기를 열어 관련 페이지를 살펴보고, 본문과 키워드를 편집해 저장합니다.

## 기술 스택

| 영역 | 기술 | 사용 목적 |
| --- | --- | --- |
| 웹 | Next.js 16, React 19, TypeScript | App Router 기반 화면과 서버 API |
| UI·상태 | CSS Modules, React Context, Custom Hooks | 스타일, 워크스페이스 상태와 비동기 작업 분리 |
| 입력 검증 | Zod 4, Pydantic 2 | 웹·Python API 요청과 응답 구조 검증 |
| 데이터 | PostgreSQL, Prisma 7, Prisma PostgreSQL Adapter | 관계형 데이터 저장과 마이그레이션 |
| 생성 AI | Google Gen AI SDK | Gemini 답변 생성 |
| Python API | FastAPI, Uvicorn, psycopg | 자연어 처리 API와 노트 페이지 조회 |
| 자연어 처리 | Sentence Transformers, Kiwi, NetworkX | 다국어 임베딩, 형태소 분석, TextRank |
| 토큰 계산 | gpt-tokenizer | 입력 문맥의 토큰 예산 산정 |
| 테스트 | Node.js Test Runner, Python unittest | API 계약, 예외 처리, 저장 및 유사도 로직 검증 |

## 시스템 구조

```mermaid
flowchart TD
    UI[React 화면 · Context · Hooks] --> Client[API Client]
    Client --> Routes[Next.js Route Handlers · Zod]
    Routes --> Services[도메인 서비스]
    Services --> Prisma[Prisma · PostgreSQL]
    Services --> Context[노트 검색 · 토큰 예산 기반 문맥 구성]
    Context --> Gemini[Google Gen AI SDK · Gemini]
    Services --> Proxy[유사도 · 키워드 HTTP 연동]
    Proxy --> Python[FastAPI · Pydantic]
    Python --> NLP[MiniLM · Kiwi · TextRank]
    Python --> DB[동일 PostgreSQL의 노트 페이지 조회]
```

브라우저는 Next.js의 같은 출처 API를 호출합니다. Next.js가 Python 서버를 호출하므로 Python 주소와 Gemini API 키를 브라우저에 전달하지 않습니다. 웹 서비스와 자연어 처리 서비스를 분리하여 Python의 모델·형태소 분석 라이브러리를 활용합니다.

## 핵심 설계와 구현

### 1. 질문을 공유하고 응답은 스레드별로 분리

질문은 `ChatWorkspace`에 속하고, 응답은 `Question`과 `Thread`를 함께 참조합니다. 같은 질문에 대한 모델별 답변을 연결하면서 각 스레드의 대화 이력을 유지하는 구조입니다.

`Promise.allSettled`로 스레드별 요청을 처리하여 일부 요청이 실패해도 다른 응답을 반영합니다. `(questionId, threadId)`에는 복합 유일성 제약을 두어 같은 질문·스레드 조합의 응답 중복 저장을 제한합니다.

관련 코드: [채팅 요청 흐름](hooks/useChatWorkspace.ts) · [데이터 모델](prisma/schema.prisma)

### 2. 지식 선택과 문맥 배치를 별도 기준으로 관리

응답 생성 시 연결된 노트에서 **활성화된 페이지 중 질문에 키워드가 포함된 페이지**를 조회합니다. 페이지는 `importance`가 높은 순서로 토큰 예산 안에 포함하고, `priority`를 기준으로 대화 문맥 내 배치 위치를 계산합니다.

질문·프롬프트·페이지·대화 이력의 토큰 수를 계산하며, 입력 한도가 별도로 설정되지 않은 경우 8,192를 기본 예산으로 사용합니다. `gpt-tokenizer`의 계산은 Gemini 고유 토큰 수와 다를 수 있으므로 추정치로 다뤄야 합니다.

**응답 생성용 페이지 검색은 키워드 매칭이며, 임베딩 유사도는 답변을 페이지로 저장할 때 관련 페이지를 보여주는 별도 기능입니다.**

관련 코드: [페이지 검색](service/pageService.ts) · [문맥 서비스](service/ai/contextService.ts) · [토큰 기반 문맥 구성](lib/context/buildContext.ts)

### 3. 편집 요청의 순서와 실패 처리

자동 저장 훅은 페이지별 변경 필드를 병합하고, 진행 중인 저장 뒤에 다음 배치를 연결합니다. 저장 실패 시 변경 내용을 대기 목록에 다시 병합하여 이후 저장 시 재시도할 수 있도록 합니다. 특정 필드만 대기 목록에서 제거하는 기능도 제공하여 제목 변경과 다른 편집을 함께 다룹니다.

탭 숨김·페이지 이탈·컴포넌트 해제 시 저장을 시도하지만, 브라우저 종료 시 저장 완료를 보장하는 방식은 아닙니다.

관련 코드: [공통 자동 저장 훅](hooks/useAutoSave.ts)

### 4. Python 연동 경계의 오류 구분

유사도 서비스는 입력뿐 아니라 Python 응답도 검증합니다. 요청한 노트와 다른 페이지나 중복 페이지가 포함된 응답을 거부하고, 연결 실패·비정상 응답·30초 시간 초과를 구분합니다.

| 상황 | HTTP 상태 |
| --- | --- |
| 잘못된 입력 또는 JSON | 400 |
| Python 오류 응답 또는 응답 구조 오류 | 502 |
| Python 서버 연결 실패 | 503 |
| Python 요청 시간 초과 | 504 |

브라우저의 요청 취소는 Python으로 향하는 HTTP 요청에도 전달합니다. 이미 실행 중인 Python 모델 연산의 중단까지 보장하지는 않습니다.

관련 코드: [유사도 연동](service/similarityService.ts) · [키워드 연동](service/keywordService.ts) · [공통 HTTP 처리](lib/api/route.ts)

### 5. 그래프 중요도와 의미 유사도를 결합한 키워드 추출

Kiwi로 명사·영어 후보를 추출하고, 단어의 동시 등장 관계로 구성한 그래프에서 TextRank 점수를 계산합니다. 원문과 후보의 MiniLM 임베딩으로 의미 유사도를 구한 뒤 두 점수를 각각 최대값으로 정규화해 결합합니다.

```text
최종 점수 = sqrt(정규화된 TextRank × 정규화된 의미 유사도)
```

음수 의미 유사도는 0으로 처리합니다. 빈 입력이나 후보가 없는 경우에는 불필요한 임베딩 계산을 건너뜁니다. MiniLM 모델을 캐시하여 재사용하고 Kiwi는 최초 키워드 요청 시 로드합니다.

관련 코드: [키워드 추출](python/ai_server/keyword_service.py) · [Python API 상세](python/README.md)

## 데이터 모델

```mermaid
erDiagram
    ChatWorkspace ||--o{ Thread : contains
    ChatWorkspace ||--o{ Question : receives
    Question ||--o{ Answer : has
    Thread ||--o{ Answer : stores
    Note ||--o{ Page : contains
    Note o|--o{ ChatWorkspace : provides_context
    Prompt o|--o{ ChatWorkspace : configures
```

워크스페이스·스레드·질문 삭제 시 관련 하위 데이터는 `Cascade`로 처리합니다. 연결된 노트 또는 프롬프트가 삭제되면 채팅의 연결 필드는 `SetNull`로 해제합니다.

## 디렉터리 구조

```text
app/
  (workspace)/          채팅·노트·프롬프트 화면
  api/                  Next.js API 라우트
components/             워크스페이스·페이지·모달 UI
hooks/                  데이터 로딩·채팅·자동 저장 로직
context/                워크스페이스별 React Context
api/                    브라우저 API 클라이언트
service/                도메인 CRUD·Python 연동 서비스
  ai/                   모델 분기·Gemini 호출·문맥 서비스
lib/                    공통 HTTP·Prisma·문맥 구성 유틸리티
zrc/lib/schemas/        Zod 스키마와 DTO
prisma/                 데이터 모델과 마이그레이션
python/ai_server/       FastAPI·페이지 조회·자연어 처리
tests/                 웹 API 및 클라이언트 로직 테스트
python/tests/           Python 서비스 테스트
```

## 로컬 실행

### 사전 준비

- Next.js 16을 실행할 수 있는 Node.js 환경과 npm
- Python 3.10 이상
- 실행 중인 PostgreSQL과 접속 가능한 데이터베이스
- 사용 가능한 Gemini API 키

### 1. 의존성과 환경변수

저장소 루트에서 실행합니다.

```powershell
npm ci
```

루트에 `.env` 파일을 만들고 값을 설정합니다. 아래 값은 예시입니다.

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/ai_platform
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
SIMILARITY_API_URL=http://127.0.0.1:8000/similarity
KEYWORD_API_URL=http://127.0.0.1:8000/keywords
```

Python API 주소는 기본값과 같다면 생략할 수 있습니다. Prisma 설정은 `dotenv/config`로 `.env`를 읽습니다. Python과 Next.js가 같은 데이터베이스를 사용하도록 설정합니다.

### 2. 데이터베이스 초기화

설정 파일 이름이 `prisma7.config.ts`이므로 CLI 실행 시 명시합니다.

```powershell
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
```

### 3. Python API 실행

```powershell
py -m venv python/.venv
./python/.venv/Scripts/python.exe -m pip install -r python/requirements-dev.txt
./python/.venv/Scripts/python.exe -m uvicorn ai_server.main:app --app-dir python --host 127.0.0.1 --port 8000
```

최초 실행 시 `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` 모델 다운로드가 필요합니다. 모델 로딩 후 요청을 받으며, 여러 worker를 사용하면 프로세스마다 모델을 로드합니다.

### 4. 웹 실행

다른 터미널에서 실행합니다.

```powershell
npm run dev
```

웹: [localhost:3000](http://localhost:3000) · Python API 명세: [localhost:8000/docs](http://localhost:8000/docs)

Python 환경설정과 API 계약의 자세한 내용은 [Python 서버 README](python/README.md)를 참고하세요.

## 검증 방법

저장소에 포함된 검사와 테스트는 다음 명령으로 실행합니다.

```powershell
npm run lint
node --test tests/api-http.test.mjs
./python/.venv/Scripts/python.exe -m unittest discover -s python/tests -v
npm run build
```

| 테스트 영역 | 주요 검증 내용 |
| --- | --- |
| HTTP 공통 처리 | JSON 전송, 204 처리, 구조화된 오류, 요청 취소 |
| 입력·응답 계약 | 라우트 검증, Python 응답 형식, 다른 노트 및 중복 페이지 거부 |
| 편집 흐름 | 자동 저장 순서, 대기 중 필드 제거, 제목 변경 실패 처리 |
| 채팅·노트 연결 | 채팅 전환 중 이전 노트 연결 숨김, 연결된 노트에 페이지 저장 |
| 유사도 | 페이지와 점수 대응, 반올림, 빈 노트의 연산 생략, DB 파라미터 처리 |
| 키워드 | 한국어 명사 후보, 점수·정렬, 빈 입력 처리, API 검증 |

위 목록은 저장소의 테스트 범위입니다. 실제 Gemini 응답 품질, 운영 성능, 전체 브라우저 사용자 흐름의 검증 결과를 의미하지 않습니다.

## 현재 범위와 개선 과제

- **공급자 확장:** OpenAI·Anthropic의 실제 API 연동과 공급자별 설정 변환이 필요합니다.
- **문맥 검증:** Gemini 전용 토큰 계산, 시스템 지시문 전달, 메시지 순서와 초과 길이 입력 처리에 대한 통합 검증이 필요합니다.
- **생성 실패 처리:** Gemini 호출 예외를 응답 문자열로 반환하는 현재 방식을 오류·재시도·실패 상태 처리로 개선할 수 있습니다.
- **검색 고도화:** 현재 응답 생성의 키워드 매칭에 의미 검색을 결합하고 검색 품질을 평가할 수 있습니다.
- **운영 준비:** 사용자 인증·데이터 접근 권한·비밀정보 및 로그 관리·배포 환경 검증이 필요합니다.
- **정량 평가:** 응답 지연, 키워드 품질, 유사도 검색 품질에 대한 측정 기준과 벤치마크를 추가할 수 있습니다.

이 저장소에서 확인되지 않은 운영 성과, 성능 개선 수치, 사용자 수, 개발 인원·기간은 기재하지 않았습니다.
