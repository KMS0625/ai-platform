import type { Collection } from "@/types/Collection";

export function createCollectionData(
    options: Partial<Collection> = {}
): Collection {
    return {
        id: options.id ?? crypto.randomUUID(),
        title: options.title ?? "new Collection",
        createAt: options.createAt ?? new Date(),
        order: options.order ?? 0,
    };
}