// import { Thread } from "@/models/Thread";
// import { AIModel } from "@/types/AIModel";

// type CreateThreadParams = {
//     id?: string;
//     workspaceId: string;
//     title: string;
//     model: AIModel;
//     order: number;
//     createdAt?: Date;
// };

// export function createThreadData({
//     id,
//     workspaceId,
//     title,
//     model,
//     order,
//     createdAt,
// }: CreateThreadParams): Thread {
//     const now = new Date();
//     return {
//         id: id ?? crypto.randomUUID(),
//         workspaceId,
//         model,
//         title,
//         createdAt: createdAt ?? now,
//         updatedAt: now,
//         order,
//     };
// }