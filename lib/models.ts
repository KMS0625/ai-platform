export interface ModelOption {
    model: string;
    label: string;
}

export interface ModelInfo extends ModelOption {
    provider: string;
    
}

export const MODEL_CATALOG: Record<string, ModelOption[]> = {
    Gemini: [
        { model: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
        { model: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Light" },
        { model: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Light" },
        { model: "gemini-3.8-flash", label: "Gemini 3.8 Flash" },
        { model: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
    ],
    OpenAI: [
        { model: "gpt-4o", label: "GPT-4o" },
        { model: "gpt-4.1", label: "GPT-4.1" },
    ],
    Anthropic: [

    ],
}

export const PROVIDERS = Object.keys(MODEL_CATALOG);

const MODEL_MAP: Map<string, ModelInfo> = new Map(
    Object.entries(MODEL_CATALOG).flatMap(([provider, options]) => 
        options.map((o): [string, ModelInfo] => [o.model, { ...o,  provider }])
))

export function getModelInfo(id: string): ModelInfo {
    return MODEL_MAP.get(id) ?? { provider: "unknown", model: id, label: id};
}

export function isValidModel(id: string): boolean {
    return MODEL_MAP.has(id);
}