import { Answer } from "@/models/Answer";
import { Question } from "@/models/Question";
import type { Thread } from "@/models/Thread";
import type { MessageView, ThreadView } from "@/view-model/ThreadsWorkspace-vies";

import { useState } from "react";

export function useThreadView() {
    const [threadViews, setThreadViews] = useState<ThreadView[]>([]);
    const isAnswer = (message: Question | Answer): message is Answer => "questionId" in message;

    const appendView = (thread: Thread, message: MessageView[] = []) => {
        const view = buildThreadView(thread, message);

        setThreadViews((prev) => [...prev, view])
    }

    const buildThreadView = (thread: Thread, messages: MessageView[] = []): ThreadView => {
        return {
            thread,
            messages,
        };
    };

    const buildMessageView = (message: Question | Answer): MessageView => 
        isAnswer(message)
            ? { type: "answer", data: message }
            : { type: "question", data: message };

    const clearView = () => {
        setThreadViews([]);
    }

    const replaceViews = (view: ThreadView[]) => {
        setThreadViews(view);
    }

    const deleteView = (id: string) => {
        const next = threadViews.filter((v) => v.thread.id !== id);
        setThreadViews(next);
        return next.length === 0;
    };

    const appendAnswer = (answer: Answer) => {        
        setThreadViews((prev) =>
            prev.map((view) =>
                view.thread.id === answer.threadId
                    ? {
                        ...view,
                        messages: [
                            ...view.messages,
                            { type: "answer", data: answer },
                        ],
                    }
                    : view,
            ),
    );
    };

    const appendQuestion = (question: Question) => {
        setThreadViews((prev) =>
            prev.map((view) => ({
            ...view,
            messages: [...view.messages, { type: "question", data: question }],
            })));
    };

    return {
        threadViews,
        appendView,
        clearView,
        replaceViews,
        deleteView,
        appendAnswer,
        appendQuestion,
    };
}