import z from "zod";

export const UpdateTitleSchema = z.object({ title: z.string().trim().min(1) });
export type UpdateTitleDto = z.infer<typeof UpdateTitleSchema>;
