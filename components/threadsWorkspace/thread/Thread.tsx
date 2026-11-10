import { ThreadView } from "@/view-model/ThreadsWorkspace-vies"
import styles from "./thread.module.css";
import { getModelInfo } from "@/lib/models";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DeleteHeper from "@/components/modal/deleteHelper/DeleteHelper";
import Modal from "@/components/modal/Modal";
import { useChatWorkspaceContext } from "@/context/ChatspaceContext";

type ThreadProps = {
    threadView: ThreadView;
}

console.log("Thread render");

function Thread({ threadView }: ThreadProps)  {
    
    console.log("Thread render");
    const { chatWorkspace: { deleteThread } } = useChatWorkspaceContext();
    const { thread, messages } = threadView;
    const empty = messages.length === 0;

    const { label } = getModelInfo(thread.model);

    const [ isDeleteOpen, setIsDeleteOpen ] = useState(false);

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
                            <div
                                key={message.data.id}
                                className={
                                    message.type === "question"
                                        ? styles.use
                                        : styles.assistant
                                }
                            >
                                {message.data.content}
                                
                            </div >
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