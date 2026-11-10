// 공통 fetch

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    })
    if (!res.ok) throw new Error(`request failed: ${res.status}`)
    return res.json() as Promise<T>
}