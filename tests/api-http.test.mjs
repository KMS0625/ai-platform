import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { setImmediate as nextTurn } from "node:timers/promises";
import ts from "typescript";
import { z } from "zod";

const require = createRequire(import.meta.url);

test("keyword proxy validates input, forwards parameters and checks upstream responses", async () => {
    const schemas = load("zrc/lib/schemas/keyword.ts");
    let sent;
    let response = Response.json({ items: [{ keyword: "AI", textrank: 1, semantic: 1, score: 1 }] });
    const { keywordService, KeywordServiceError } = load("service/keywordService.ts", {
        "server-only": {}, "@/zrc/lib/schemas/keyword": schemas,
    }, {
        AbortSignal, process: { env: {} },
        fetch: async (url, init) => { sent = { url, init }; return response; },
    });
    const result = await keywordService.extract({ source: "AI 모델", top_k: 5 });
    assert.equal(result.items[0].keyword, "AI");
    assert.equal(sent.url, "http://127.0.0.1:8000/keywords");
    assert.deepEqual(JSON.parse(sent.init.body), { source: "AI 모델", top_k: 5 });
    const manyItems = Array.from({ length: 12 }, (_, i) => ({ keyword: `word${i}`, textrank: 1, semantic: 1, score: 1 }));
    response = Response.json({ items: manyItems });
    assert.equal((await keywordService.extract({ source: "s" })).items.length, 5);
    assert.equal(JSON.parse(sent.init.body).top_k, 5);
    response = Response.json({ items: manyItems });
    assert.equal((await keywordService.extract({ source: "s", top_k: 2 })).items.length, 2);
    await assert.rejects(keywordService.extract({ source: "s", top_k: 0 }));
    response = Response.json({ items: [{ keyword: "x", score: 2 }] });
    await assert.rejects(keywordService.extract({ source: "s" }), e =>
        e instanceof KeywordServiceError && e.code === "INVALID_KEYWORD_RESPONSE");
    response = new Response(null, { status: 500 });
    await assert.rejects(keywordService.extract({ source: "s" }), e => e.status === 502);
});

function load(path, imports = {}, globals = {}) {
    const exports = {};
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
    });
    vm.runInNewContext(outputText, {
        exports, Headers, Request, Response, URL, Error, SyntaxError, JSON, setTimeout, clearTimeout,
        console: { error() {} },
        require: name => name in imports ? imports[name] : require(name),
        ...globals,
    });
    return exports;
}

test("request sends JSON and preserves headers, signal and keepalive", async () => {
    const signal = new AbortController().signal;
    let sent;
    const { request } = load("lib/api/client.ts", {}, {
        fetch: async (url, init) => {
            sent = { url, init };
            return Response.json({ id: "page" });
        },
    });
    assert.deepEqual(await request("/test", {
        method: "PUT", json: { title: "제목" }, signal, keepalive: true,
        headers: new Headers({ "X-Test": "yes" }),
    }), { id: "page" });
    assert.equal(sent.url, "/test");
    assert.equal(sent.init.method, "PUT");
    assert.equal(sent.init.body, '{"title":"제목"}');
    assert.equal(sent.init.headers.get("Content-Type"), "application/json");
    assert.equal(sent.init.headers.get("X-Test"), "yes");
    assert.equal(sent.init.signal, signal);
    assert.equal(sent.init.keepalive, true);
});

test("request handles 204 without parsing JSON", async () => {
    const { request } = load("lib/api/client.ts", {}, {
        fetch: async () => new Response(null, { status: 204 }),
    });
    assert.equal(await request("/test", { method: "DELETE" }), undefined);
});

test("request keeps NOT_FOUND and structured error details", async () => {
    const { request, ApiError } = load("lib/api/client.ts", {}, {
        fetch: async () => Response.json({ error: "NOT_FOUND" }, { status: 404 }),
    });
    await assert.rejects(request("/test"), error =>
        error instanceof ApiError && error.status === 404 && error.message === "NOT_FOUND");
});

test("request handles non-JSON error responses", async () => {
    const { request } = load("lib/api/client.ts", {}, {
        fetch: async () => new Response("Bad gateway", { status: 502 }),
    });
    await assert.rejects(request("/test"), error => error.status === 502 && error.body === null);
});

test("request propagates abort errors unchanged", async () => {
    const abort = new DOMException("Aborted", "AbortError");
    const { request } = load("lib/api/client.ts", {}, { fetch: async () => { throw abort; } });
    await assert.rejects(request("/test"), error => error === abort);
});

class KnownError extends Error {
    constructor(code) { super(code); this.code = code; }
}
const http = load("lib/server/http.ts", {
    "server-only": {},
    "zod": { ZodError: z.ZodError },
    "@/generated/prisma/client": { Prisma: { PrismaClientKnownRequestError: KnownError } },
});

test("handler maps validation, JSON and database errors to HTTP responses", async () => {
    let validation;
    try { z.object({ title: z.string() }).parse({}); } catch (error) { validation = error; }
    for (const [error, status, code] of [
        [validation, 400, "INVALID_INPUT"],
        [new SyntaxError(), 400, "INVALID_JSON"],
        [new KnownError("P2025"), 404, "NOT_FOUND"],
        [new KnownError("P2003"), 400, "INVALID_REFERENCE"],
        [new Error("private details"), 500, "Internal Server Error"],
    ]) {
        const route = http.handler(async () => { throw error; });
        const response = await route(new Request("http://localhost/test"), { params: Promise.resolve({}) });
        assert.equal(response.status, status);
        assert.equal((await response.json()).error, code);
    }
});

test("handler preserves successful responses and async route params", async () => {
    const route = http.handler(async (_request, { params }) => Response.json(await params, { status: 201 }));
    const response = await route(new Request("http://localhost/test"), { params: Promise.resolve({ id: "test" }) });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { id: "test" });
});

test("handler keeps cancelled requests at 499", async () => {
    const controller = new AbortController();
    controller.abort();
    const route = http.handler(async () => { throw new Error("cancelled"); });
    const response = await route(new Request("http://localhost/test", { signal: controller.signal }), { params: Promise.resolve({}) });
    assert.equal(response.status, 499);
});

test("optional JSON accepts empty bodies and rejects malformed bodies", async () => {
    assert.equal(JSON.stringify(await http.readOptionalJson(new Request("http://localhost/test", { method: "POST" }))), "{}");
    assert.deepEqual(await http.readOptionalJson(new Request("http://localhost/test", { method: "POST", body: '{"title":"x"}' })), { title: "x" });
    await assert.rejects(http.readOptionalJson(new Request("http://localhost/test", { method: "POST", body: "{" })));
});

test("thread API preserves chronological message display without mutating history", async () => {
    const rows = [{ id: 2 }, { id: 1 }];
    const signal = new AbortController().signal;
    const { threadApi } = load("api/chat/threadApi.ts", {
        "@/lib/api/route": { API: { chat: { messages: () => "/messages" } } },
        "@/lib/api/client": { request: async (url, options) => {
            assert.equal(url, "/messages");
            assert.equal(options.signal, signal);
            return rows;
        } },
        "@/api/mapper": { toMessageViews: data => data },
    });
    assert.equal(JSON.stringify(await threadApi.getMessages("c", "t", signal)), '[{"id":1},{"id":2}]');
    assert.equal(JSON.stringify(rows), '[{"id":2},{"id":1}]');
});

test("rename routes validate titles and update the matching entity", async () => {
    const titleSchema = load("zrc/lib/schemas/title.ts");
    for (const [entity, serviceName, servicePath, idKey] of [
        ["chats", "chatServie", "chat.servie", "chatId"],
        ["notes", "noteService", "noteSercive", "noteId"],
        ["prompts", "promptService", "promptServie", "promptId"],
    ]) {
        const calls = [];
        const service = { update: async (id, data) => { calls.push({ id, ...data }); return { id, ...data }; } };
        const { PATCH } = load(`app/api/workspaces/${entity}/[${idKey}]/route.ts`, {
            "@/lib/server/http": http,
            "@/zrc/lib/schemas/title": titleSchema,
            "@/zrc/lib/schemas/prompt": {},
            [`@/service/${servicePath}`]: { [serviceName]: service },
        });
        const context = { params: Promise.resolve({ [idKey]: "item" }) };
        const response = await PATCH(new Request(`http://localhost/${entity}/item`, {
            method: "PATCH", body: JSON.stringify({ title: "  새 제목  ", content: "must not change" }),
        }), context);
        assert.equal(response.status, 200);
        assert.equal(JSON.stringify(calls), '[{"id":"item","title":"새 제목"}]');
        const invalid = await PATCH(new Request(`http://localhost/${entity}/item`, {
            method: "PATCH", body: '{"title":"   "}',
        }), context);
        assert.equal(invalid.status, 400);
        assert.equal(calls.length, 1);
    }
});

test("autosave flush waits for earlier saves before a rename can proceed", async () => {
    const { useAutoSave } = load("hooks/useAutoSave.ts", {
        react: { useRef: current => ({ current }), useCallback: fn => fn, useEffect() {} },
    });
    let release;
    const calls = [];
    const autosave = useAutoSave({ save: async (id, changes) => {
        calls.push({ id, ...changes });
        await new Promise(resolve => { release = resolve; });
    } });
    autosave.schedule("prompt", { title: "old" });
    const first = autosave.flush();
    await Promise.resolve();
    let finished = false;
    const second = autosave.flush().then(() => { finished = true; });
    await Promise.resolve();
    assert.equal(finished, false);
    release();
    await Promise.all([first, second]);
    assert.equal(finished, true);
    assert.equal(calls.length, 1);
});

test("autosave can discard an obsolete title without losing other edits", async () => {
    const { useAutoSave } = load("hooks/useAutoSave.ts", {
        react: { useRef: current => ({ current }), useCallback: fn => fn, useEffect() {} },
    });
    const calls = [];
    const autosave = useAutoSave({ save: async (id, changes) => { calls.push({ id, ...changes }); } });
    autosave.schedule("prompt", { title: "old", content: "unsaved content" });
    autosave.discardFields("prompt", ["title"]);
    await autosave.flush();
    assert.equal(JSON.stringify(calls), '[{"id":"prompt","content":"unsaved content"}]');
});

test("rename input trims titles, prevents duplicate submits and closes after success", async () => {
    const slots = [];
    let cursor = 0;
    const react = {
        useState(initial) {
            const index = cursor++;
            if (!(index in slots)) slots[index] = initial;
            return [slots[index], value => { slots[index] = value; }];
        },
        useRef(current) {
            const index = cursor++;
            return slots[index] ??= { current };
        },
    };
    const { default: InputHelper } = load("components/modal/InputHelper/InputHelper.tsx", {
        react, "./input.module.css": { default: {} },
    });
    const calls = [];
    let release;
    let closed = 0;
    const props = {
        title: "이름 변경", description: "새로운 제목", defaultValue: "  새 제목  ",
        onSubmit: value => { calls.push(value); return new Promise(resolve => { release = resolve; }); },
        onClose: () => { closed++; },
    };
    const render = () => { cursor = 0; return InputHelper(props); };
    const form = render();
    form.props.onSubmit({ preventDefault() {} });
    form.props.onSubmit({ preventDefault() {} });
    assert.deepEqual(calls, ["새 제목"]);
    assert.equal(closed, 0);
    const submitting = render();
    assert.equal(submitting.props.children.find(child => child?.type === "input").props.disabled, true);
    release();
    await nextTurn();
    assert.equal(closed, 1);
});

test("rename input keeps the dialog open and shows an error after save failure", async () => {
    const states = [];
    let cursor = 0;
    const { default: InputHelper } = load("components/modal/InputHelper/InputHelper.tsx", {
        react: {
            useState(initial) {
                const index = cursor++;
                if (!(index in states)) states[index] = initial;
                return [states[index], value => { states[index] = value; }];
            },
            useRef: current => ({ current }),
        },
        "./input.module.css": { default: {} },
    });
    let closed = false;
    const props = { title: "변경", description: "", defaultValue: "제목",
        onSubmit: async () => { throw new Error("offline"); }, onClose: () => { closed = true; } };
    InputHelper(props).props.onSubmit({ preventDefault() {} });
    await nextTurn();
    cursor = 0;
    const form = InputHelper(props);
    assert.equal(closed, false);
    assert.ok(form.props.children.some(child => child?.props?.role === "alert"));
});

const pageSchemas = load("zrc/lib/schemas/page.ts", { zod: { default: z } });
const similaritySchemas = load("zrc/lib/schemas/similarity.ts", { zod: { default: z }, "./page": pageSchemas });
const NOTE_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_NOTE_ID = "22222222-2222-4222-8222-222222222222";
const PAGE_ID = "33333333-3333-4333-8333-333333333333";
const pageResult = (score = 75) => ({
    page: { id: PAGE_ID, noteId: NOTE_ID, title: "페이지", content: "본문", keywords: [],
        priority: 10, importance: 20, enabled: true, order: 10, createdAt: "2026-11-10T00:00:00Z" },
    score,
});
const input = { source: "원문", noteId: NOTE_ID };

function loadSimilarityService(fetch, extra = {}) {
    return load("service/similarityService.ts", {
        "server-only": {},
        "@/zrc/lib/schemas/similarity": similaritySchemas,
    }, {
        fetch, AbortSignal,
        process: { env: { SIMILARITY_API_URL: "http://python:8000/similarity" } },
        ...extra,
    });
}

test("similarity proxy sends source and noteId, and preserves page information and scores", async () => {
    let sent;
    const items = [pageResult(-5)];
    const { similarityService } = loadSimilarityService(async (url, options) => {
        sent = { url, options };
        return Response.json({ items });
    });
    const result = await similarityService.calculate({ ...input, source: " 원문 ", targets: ["must not be sent"] });
    assert.deepEqual(JSON.parse(JSON.stringify(result)), { items });
    assert.equal(sent.url, "http://python:8000/similarity");
    assert.equal(sent.options.method, "POST");
    assert.equal(sent.options.cache, "no-store");
    assert.deepEqual(JSON.parse(sent.options.body), { source: " 원문 ", noteId: NOTE_ID });
});

test("similarity proxy skips upstream for null noteId and rejects invalid input", async () => {
    let calls = 0;
    const { similarityService } = loadSimilarityService(async () => { calls++; });
    assert.equal(JSON.stringify(await similarityService.calculate({ source: "s", noteId: null })), '{"items":[]}');
    for (const data of [{ source: 42, noteId: NOTE_ID }, { source: "s", noteId: "invalid" }, { source: "s" }]) {
        await assert.rejects(similarityService.calculate(data));
    }
    assert.equal(calls, 0);
});

test("similarity proxy accepts an empty note and preserves page result order", async () => {
    const first = pageResult(10);
    const second = { ...pageResult(90), page: { ...pageResult().page, id: "44444444-4444-4444-8444-444444444444" } };
    for (const items of [[], [first, second]]) {
        const { similarityService } = loadSimilarityService(async () => Response.json({ items }));
        assert.deepEqual(JSON.parse(JSON.stringify(await similarityService.calculate(input))), { items });
    }
});

test("similarity proxy rejects invalid responses, foreign-note pages and duplicate pages", async () => {
    const foreignPage = { ...pageResult(), page: { ...pageResult().page, noteId: OTHER_NOTE_ID } };
    for (const body of [{}, { scores: [75] }, { items: [pageResult(101)] }, { items: [pageResult(-101)] },
        { items: [{ score: 75 }] }, { items: [foreignPage] }, { items: [pageResult(), pageResult()] }]) {
        const { similarityService } = loadSimilarityService(async () => Response.json(body));
        await assert.rejects(similarityService.calculate(input),
            error => error.status === 502 && error.code === "INVALID_SIMILARITY_RESPONSE");
    }
    const { similarityService } = loadSimilarityService(async () => new Response("not json"));
    await assert.rejects(similarityService.calculate(input),
        error => error.status === 502 && error.code === "INVALID_SIMILARITY_RESPONSE");
});

test("similarity proxy distinguishes upstream HTTP errors, connection failure and timeout", async () => {
    for (const [fetch, status, code] of [
        [async () => new Response(null, { status: 500 }), 502, "SIMILARITY_UPSTREAM_ERROR"],
        [async () => { throw new TypeError("connection refused"); }, 503, "SIMILARITY_UNAVAILABLE"],
    ]) {
        const { similarityService } = loadSimilarityService(fetch);
        await assert.rejects(similarityService.calculate(input), error => error.status === status && error.code === code);
    }
    const timeout = new AbortController();
    const { similarityService } = loadSimilarityService(async () => {
        timeout.abort();
        throw new Error("timeout");
    }, { AbortSignal: { timeout: () => timeout.signal } });
    await assert.rejects(similarityService.calculate(input),
        error => error.status === 504 && error.code === "SIMILARITY_TIMEOUT");
});

test("similarity proxy forwards client cancellation", async () => {
    const controller = new AbortController();
    const abort = new DOMException("cancelled", "AbortError");
    const { similarityService } = loadSimilarityService(async (_url, { signal }) => {
        controller.abort();
        assert.equal(signal.aborted, true);
        throw abort;
    });
    await assert.rejects(similarityService.calculate(input, controller.signal), error => error === abort);
});

test("similarity Next route validates input and returns page results or upstream status", async () => {
    const service = loadSimilarityService(async () => Response.json({ items: [pageResult()] }));
    const { POST } = load("app/api/similarity/route.ts", {
        "@/lib/server/http": http,
        "@/service/similarityService": service,
        "@/zrc/lib/schemas/similarity": similaritySchemas,
    });
    const context = { params: Promise.resolve({}) };
    const send = body => POST(new Request("http://localhost/api/similarity", {
        method: "POST", body: JSON.stringify(body),
    }), context);
    const success = await send(input);
    assert.equal(success.status, 200);
    assert.deepEqual(await success.json(), { items: [pageResult()] });
    assert.equal((await send({ source: "s" })).status, 400);
    const skipped = await send({ source: "s", noteId: null });
    assert.deepEqual(await skipped.json(), { items: [] });
    service.similarityService.calculate = async () => { throw new service.SimilarityServiceError(503, "SIMILARITY_UNAVAILABLE"); };
    assert.equal((await send(input)).status, 503);
});

test("similarity client skips fetch for null and otherwise sends only source and noteId", async () => {
    let sent;
    let calls = 0;
    const { similarityApi } = load("api/similarity/similarityApi.ts", {
        "@/lib/api/client": { request: async (url, options) => { calls++; sent = { url, options }; return { items: [pageResult()] }; } },
        "@/lib/api/route": { API: { similarity: "/api/similarity" } },
        "@/zrc/lib/schemas/similarity": similaritySchemas,
    });
    assert.equal(JSON.stringify(await similarityApi.calculate({ source: "s", noteId: null })), '{"items":[]}');
    assert.equal(calls, 0);
    const signal = new AbortController().signal;
    assert.deepEqual(JSON.parse(JSON.stringify(await similarityApi.calculate(input, signal))), { items: [pageResult()] });
    assert.equal(sent.url, "/api/similarity");
    assert.equal(sent.options.method, "POST");
    assert.equal(sent.options.signal, signal);
    assert.equal(JSON.stringify(sent.options.json), JSON.stringify(input));
});

test("switching chats hides the previous noteId until the new context loads", async () => {
    const states = [];
    let cursor = 0;
    let effect;
    const { useChatContext: runChatContext } = load("hooks/useChatContext.ts", {
        react: {
            useState(initial) {
                const index = cursor++;
                if (!(index in states)) states[index] = initial;
                return [states[index], value => { states[index] = value; }];
            },
            useCallback: fn => fn,
            useEffect: fn => { effect = fn; },
        },
        "@/api/chat/chatApi": { chatApi: { getContext: async id => ({ noteId: id === "a" ? NOTE_ID : OTHER_NOTE_ID, promptId: null }) } },
    });
    const render = id => { cursor = 0; return runChatContext(id); };
    assert.equal(render("a").context.noteId, null);
    const cleanup = effect();
    await nextTurn();
    assert.equal(render("a").context.noteId, NOTE_ID);
    const switching = render("b");
    assert.equal(switching.context.noteId, null);
    assert.equal(switching.isLoading, true);
    cleanup();
    effect();
    await nextTurn();
    assert.equal(render("b").context.noteId, OTHER_NOTE_ID);
});

test("chat page creation saves the complete draft to the connected note and propagates failures", async () => {
    const calls = [];
    let similarityItems = [];
    let similarityCalls = 0;
    let noteId = NOTE_ID;
    let failure;
    const { useChatWorkspace } = load("hooks/useChatWorkspace.ts", {
        react: { useState: value => [value, () => {}], useRef: current => ({ current }), useEffect() {}, useCallback: fn => fn },
        "next/navigation": { useParams: () => ({ workspaceId: "chat" }), useRouter: () => ({}) },
        "@/constants/section": {},
        "./useThread": { useThread: () => ({}) },
        "./useThreadViews": { useThreadView: () => ({ threadViews: [] }) },
        "./useChatContext": { useChatContext: () => ({ context: { noteId, promptId: null } }) },
        "@/api/chat/chatApi": {},
        "@/api/chat/threadApi": {},
        "@/api/chat/questionApi": {},
        "@/api/chat/answerApi": {},
        "@/api/similarity/similarityApi": { similarityApi: { calculate: async () => {
            similarityCalls++;
            return { items: similarityItems };
        } } },
        "@/api/note/pageApi": { pageApi: { create: async (id, data) => {
            if (failure) throw failure;
            calls.push({ id, data });
            return { id: PAGE_ID, ...data };
        } } },
    });
    const draft = { title: "새 페이지", keywords: ["키워드", "답변"], content: "AI 답변\n원문" };
    const created = await useChatWorkspace({}).makePage(draft);
    assert.equal(created.id, PAGE_ID);
    assert.deepEqual(calls, [{ id: NOTE_ID, data: draft }]);
    similarityItems = [pageResult(10), pageResult(90), pageResult(-5), pageResult(60)];
    const top = await useChatWorkspace({}).getSimiralityPages(draft);
    assert.deepEqual(Array.from(top, item => item.score), [90, 60, 10]);
    assert.deepEqual(similarityItems.map(item => item.score), [10, 90, -5, 60]);
    const comparisonWorkspace = useChatWorkspace({});
    for (const count of [0, 1, 2]) {
        similarityItems = Array.from({ length: count }, () => pageResult());
        assert.equal((await comparisonWorkspace.getSimiralityPages(draft)).length, count);
    }
    failure = new Error("save failed");
    await assert.rejects(useChatWorkspace({}).makePage(draft), error => error === failure);
    noteId = null;
    const before = similarityCalls;
    assert.equal((await useChatWorkspace({}).getSimiralityPages(draft)).length, 0);
    assert.equal(similarityCalls, before);
    await assert.rejects(useChatWorkspace({}).makePage(draft), /연결된 노트가 없습니다/);
    assert.equal(calls.length, 1);
});

test("answer modal always renders three slots and labels every missing page", () => {
    const { default: AnswerPageHelper } = load("components/modal/AnswerPageHelper/AnswerPageHelper.tsx", {
        react: { useEffect() {}, useState: value => [value, () => {}], useRef: current => ({ current }), useId: () => "modal" },
        "@/utils/parseKeywords": { parseKeywords: () => [] },
        "@/components/noteWorkspace/Page/pageCard.module.css": { default: {} },
        "./answerPageHelper.module.css": { default: {} },
    });
    const find = (node, type) => !node || typeof node !== "object" ? [] : [
        ...(node.type === type ? [node] : []),
        ...[node.props?.children].flat(Infinity).flatMap(child => find(child, type)),
    ];
    for (const count of [0, 1, 2, 3]) {
        const pages = Array.from({ length: count }, (_, index) => ({ id: String(index), title: `페이지 ${index}`, content: "본문" }));
        const form = AnswerPageHelper({ content: "답변", pages, onClose() {} });
        assert.equal(find(form, "article").length, 3);
        assert.equal(find(form, "h4").filter(node => node.props.children === "없는 페이지").length, 3 - count);
    }
});
