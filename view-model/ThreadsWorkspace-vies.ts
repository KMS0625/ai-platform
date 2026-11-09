import { Answer } from "@/models/Answer";
import { Message } from "@/models/Message";
import { Question } from "@/models/Question";
import { Thread } from "@/models/Thread";

export type ThreadView = {
    thread: Thread;
    messages: MessageView[];
}



export type MessageView =
    | {
        type: "question";
        data: Question;
    }
    | {
        type: "answer";
        data: Answer;
    };