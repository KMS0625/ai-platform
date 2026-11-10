export class ApiError extends Error {
    constructor(public readonly status: number, public readonly body: unknown) {
        const error = typeof body === "object" && body !== null && "error" in body
            ? body.error : undefined;
        super(status === 404 ? "NOT_FOUND" : typeof error === "string" ? error : `Request failed: ${status}`);
        this.name = "ApiError";
    }
}

type RequestOptions = Omit<RequestInit, "body"> & { json?: unknown };

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { json, headers: initialHeaders, ...init } = options;
    const headers = new Headers(initialHeaders);
    if (json !== undefined) headers.set("Content-Type", "application/json");

    const response = await fetch(url, {
        ...init,
        headers,
        ...(json !== undefined && { body: JSON.stringify(json) }),
    });
    if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        throw new ApiError(response.status, body);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}
