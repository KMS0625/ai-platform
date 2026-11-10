import prisma from "@/lib/prisma";
import { CreateNoteSchema, UpdateNoteSchema } from "@/zrc/lib/schemas/note";
import type { CreateNoteDto, UpdateNoteDto, NoteListResponseDto, NoteResponseDto, NoteWithPagesResponseDto } from "@/zrc/lib/schemas/note";
import { toNoteDto, toPageDto } from "./dtoMappers";

const ORDER_STEP = 10;
const DEFALUT_TITLE = "새로운 노트";

export const noteService = {
    async update(id: string, data: UpdateNoteDto): Promise<NoteResponseDto> {
        const note = await prisma.note.update({ where: { id }, data: UpdateNoteSchema.parse(data) });
        return toNoteDto(note);
    },
    async createWithPage(data: CreateNoteDto = {}): Promise<NoteWithPagesResponseDto> {
        const input = CreateNoteSchema.parse(data);
        const note = await prisma.$transaction(async (tx) => {
            const { _max } = await tx.note.aggregate({
                _max: { order: true }
            })

            const total = await tx.note.count();

            return tx.note.create({
                data: {
                    title: input.title ?? `${DEFALUT_TITLE} ${total}`,
                    order: (_max.order ?? 0) + ORDER_STEP,
                    pages: {
                        create: {
                            ...input.page,
                            title: input.page?.title ?? "new page 0",
                        }
                    }
                },
                include: { pages: true },
            })
        })
        return { ...toNoteDto(note), pages: note.pages.map(toPageDto) };
    },
    async findAll(): Promise<NoteListResponseDto> {
        const notes = await prisma.note.findMany({
            orderBy: { order: "desc" }
        })
        return notes.map(toNoteDto);
    },
    async delete(id: string): Promise<NoteResponseDto> {
        const note = await prisma.note.delete({
            where: { id }
        })
        return toNoteDto(note);
    }
}
