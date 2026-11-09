import { ThreadMessage } from "@/types/ThreadMessage";
import { answerService } from "./answerService";

export async function getMessages(
    threadId: string,
): Promise<ThreadMessage[]> {
  const answers = await answerService.findAnswersWithQuestion(threadId);

  return answers.flatMap<ThreadMessage>((a) => [
    { role: "user", content: a.question.content },
    { role: "ai", content: a.content ?? "" },
  ]);
}