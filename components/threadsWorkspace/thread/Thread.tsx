import { ThreadView } from "@/view-model/ThreadsWorkspace-vies"
import styles from "./thread.module.css";
import { getModelInfo } from "@/lib/models";
import { useState } from "react";
import DeleteHeper from "@/components/modal/deleteHelper/DeleteHelper";
import Modal from "@/components/modal/Modal";
import { useChatWorkspaceContext } from "@/context/ChatspaceContext";

type ThreadProps = {
    threadView: ThreadView;
}

function Thread({ threadView }: ThreadProps)  {
    const { chatWorkspace: { deleteThread } } = useChatWorkspaceContext();
    const { thread, messages } = threadView;
    const empty = messages.length === 0;

    const { label } = getModelInfo(thread.model);

    const [ isDeleteOpen, setIsDeleteOpen ] = useState(false);

    const handleDelete = () => {
        setIsDeleteOpen(true);
    }

    const handleSubmit = () => {
        deleteThread(threadView.thread.id);
        setIsDeleteOpen(false);
    }

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

            <div className={styles.conversation}> 
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
                            </div>
                        ))}

                        { }
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

export default Thread;