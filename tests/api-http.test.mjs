import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { setImmediate as nextTurn } from "node:timers/promises";
import ts from "typescript";
import { z } from "zod";

const require = createRequire(import.meta.url);

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
