import { ThreadView } from "@/view-model/ThreadsWorkspace-vies"
import styles from "./thread.module.css";
import { getModelInfo } from "@/lib/models";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DeleteHeper from "@/components/modal/deleteHelper/DeleteHelper";
import Modal from "@/components/modal/Modal";
import { useChatWorkspaceContext } from "@/context/ChatspaceContext";
import AnswerPageHelper from "@/components/modal/AnswerPageHelper/AnswerPageHelper";
import type { Answer } from "@/models/Answer";
import type { CreatePageDto } from "@/zrc/lib/schemas/page";
import type { PageSimilarityDto } from "@/zrc/lib/schemas/similarity";
import { keywordApi } from "@/api/keywords/keywordApi";

type ThreadProps = {
    threadView: ThreadView;
}

console.log("Thread render");

function Thread({ threadView }: ThreadProps)  {
    
    console.log("Thread render");

    const { chatWorkspace: {
        context, 
        deleteThread, 
        makePage,  
        getSimiralityPages } } = useChatWorkspaceContext();

    const { thread, messages } = threadView;
    const empty = messages.length === 0;

    const { label } = getModelInfo(thread.model);

    const [ isDeleteOpen, setIsDeleteOpen ] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
    const [similarPages, setSimilarPages] = useState<PageSimilarityDto[]>([]);
    const [pagesLoading, setPagesLoading] = useState(false);
    const [pagesError, setPagesError] = useState("");
    const answerButtonRef = useRef<HTMLButtonElement | null>(null);
    
    const closeAnswerModal = () => {
        setSelectedAnswer(null);
        answerButtonRef.current?.focus({ preventScroll: true });
    };

    const handleCreatePage = async (draft: CreatePageDto) => {
        await makePage(draft);
    };

    const handleGenerateKeywords = async (source: string, signal: AbortSignal) => {
        const { items } = await keywordApi.extract({ source }, signal);
        return items.map(item => item.keyword);
    };

    useEffect(() => {
        if (!selectedAnswer) return;
        const controller = new AbortController();
        const loadPages = async () => {
            setSimilarPages([]);
            setPagesError("");
            setPagesLoading(Boolean(context.noteId));
            try {
                const items = context.noteId
                    ? await getSimiralityPages({ content: selectedAnswer.content }, controller.signal)
                    : [];
                if (!controller.signal.aborted) setSimilarPages(items);
            } catch {
                if (!controller.signal.aborted) setPagesError("참고 페이지를 가져오지 못했습니다.");
            } finally {
                if (!controller.signal.aborted) setPagesLoading(false);
            }
        };
        void loadPages();
        return () => controller.abort();
    }, [selectedAnswer, context.noteId, getSimiralityPages]);

    const conversationRef = useRef<HTMLDivElement>(null);
    const isFirst = useRef(true);

    const handleDelete = () => {
        setIsDeleteOpen(true);
    }

    const handleSubmit = () => {
        deleteThread(threadView.thread.id);
        setIsDeleteOpen(false);
    }

    const lastContent = messages.at(-1)?.data.content ?? 0;
    const prevLength = useRef(0);
    const isWaiting = threadView.isWaitingForResponse;

    useLayoutEffect(() => {
        console.log("isWaiting", isWaiting);
        const el = conversationRef.current;
        if (!el) return;

        // 1) 처음 진입: 애니메이션 없이 바로 이동
        if (isFirst.current) {
            el.scrollTop = el.scrollHeight;
            isFirst.current = false;
            prevLength.current = messages.length;
            return;
        }

        // 2) 새 메시지가 추가됨: 스무스하게 이동
        if (messages.length !== prevLength.current) {
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            prevLength.current = messages.length;
            return;
        }

        // 3) 같은 메시지 내용이 늘어남(스트리밍): 즉시 이동
        el.scrollTop = el.scrollHeight;
    }, [messages.length, lastContent, isWaiting]);

    
    return(
        <section className={styles.container}>
            <header className={styles.header}>
                <div className={styles.title}>
                    <strong> {label} </strong> 
                </div>
                
                <button className={styles.closeButton} onClick={handleDelete}>
                    X
                </button>
            </header>

            <div ref={conversationRef} className={styles.conversation}> 
                { empty ? (
                    <div className={styles.empty}>
                        <p>{label}</p>
                        질문을 입력하면 대화가 시작됩니다.
                    </div>
                ) : (
                    <div className={styles.messages}>
                        { messages.map((message) => (
                            message.type === "question" ? (
                                <div key={`question-${message.data.id}`} className={styles.use}>
                                    {message.data.content}
                                </div>
                            ) : (
                                <button
                                    key={`answer-${message.data.id}`}
                                    type="button"
                                    className={`${styles.assistant} ${styles.answerButton}`}
                                    title="답변을 페이지로 만들기"
                                    aria-label="답변을 페이지로 만들기"
                                    onClick={event => {
                                        answerButtonRef.current = event.currentTarget;
                                        setSimilarPages([]);
                                        setPagesError("");
                                        setPagesLoading(Boolean(context.noteId));
                                        setSelectedAnswer(message.data);
                                    }}
                                >
                                    {message.data.content}
                                </button>
                            )
                        ))}
                        { isWaiting &&     
                            <div className={styles.waiting}>
                                <span>기다리는 중...</span>
                            </div>
                        }
                    </div>
                )}
            </div>

            <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DeleteHeper 
                title={`${label}을 삭제하시겠습니까?`}
                description={"삭제하면 복구할 수 없습니다."}
                onClose={() => setIsDeleteOpen(false)}
                onSubmit={handleSubmit}
                />
            </Modal>
            <Modal isOpen={selectedAnswer !== null} onClose={closeAnswerModal}>
                {selectedAnswer && (
                    <AnswerPageHelper 
                    key={selectedAnswer.id} 
                    content={selectedAnswer.content}
                    pages={similarPages.map(item => item.page)}
                    pagesLoading={pagesLoading}
                    pagesError={pagesError}
                    onClose={closeAnswerModal} 
                    onGenerateKeywords={handleGenerateKeywords}
                    disabledReason={context.noteId ? undefined : "채팅에 노트를 먼저 연결해 주세요."}
                    onSubmit={handleCreatePage} />
                )}
            </Modal>
        </section>
    )
}
                        // <div className={styles.typingIndicator}>
                        //     <span className={styles.typingDot} />
                        //     <span className={styles.typingDot} />
                        //     <span className={styles.typingDot} />
                        //     기다리는 중
                        // </div>

export default Thread;
