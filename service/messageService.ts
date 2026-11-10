import type { MessageDto, MessageListResponseDto } from "@/zrc/lib/schemas/message";
import { answerService } from "./answerService";

export async function getMessages(
    threadId: string,
): Promise<MessageListResponseDto> {
  const answers = await answerService.findAnswersWithQuestion(threadId);

  // 최신 메시지부터 가져온다
  return answers.flatMap<MessageDto>((a) => [
    { role: "ai", content: a.content ?? "" },
    { role: "user", content: a.question.content },
  ]);
}
