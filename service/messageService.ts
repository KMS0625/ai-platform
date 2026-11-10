import { ThreadMessage } from "@/types/ThreadMessage";
import { answerService } from "./answerService";

export async function getMessages(
    threadId: string,
): Promise<ThreadMessage[]> {
  const answers = await answerService.findAnswersWithQuestion(threadId);

  // 최신 메시지부터 가져온다
  return answers.flatMap<ThreadMessage>((a) => [
    { role: "ai", content: a.content ?? "" },
    { role: "user", content: a.question.content },
  ]);
}