// style
import styles from "./threadsWorkspace.module.css";

import { ThreadView } from "@/view-model/ThreadsWorkspace-vies";
import Thread from "./thread/Thread";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import clsx from "clsx";
import Modal from "../modal/Modal";
import ModelSelect from "../modal/modelSelect/ModelSelect";
import { useChatWorkspaceContext } from "@/context/ChatspaceContext";

import ChatInput from "@/components/chatInput/ChatInput";
import { ModelInfo } from "@/lib/models";
import ChatHelper from "../modal/ChatHelper/ChatHelper";

type ThreadsWorkspaceProps = {
    threadsView: ThreadView[];
};

function ThreadsWorkspace({ threadsView }: ThreadsWorkspaceProps) {
    
    const [text, setText] = useState("");
    
    const [isNewThread, setIsNewThread] = useState(false);
    const [isHelperOpen, setHelperOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isModelSelectOpen, setModelSelectOpen] = useState(false);

    const { chatWorkspace } = useChatWorkspaceContext();

    const boardRef = useRef<HTMLDivElement>(null);
    const prevBoardRef = useRef(threadsView.length);

    // FLIP 애니메이션용
    const itemRefs = useRef(new Map<string, HTMLDivElement>());
    const prevRects = useRef(new Map<string, number>());
    const knownIds = useRef(new Set<string>());
    const [newIds, setNewIds] = useState<Set<string>>(new Set());

    const handleSubmit = async () => {
        const question = text.trim();
        setText("");
        setIsLoading(true);

        try {
            await chatWorkspace.sendQuestion(question);
        } catch (e) {
            setText(question); // 실패 시 입력값 복구
        } finally {
            setIsLoading(false);
        }
    };

    // 새 스레드가 추가되어 넘칠 때 오른쪽 끝으로 스크롤
    useEffect(() => {
        const el = boardRef.current;
        if (!el || !isNewThread) return;

        if (threadsView.length > prevBoardRef.current) {
            el.scroll({
                left: el.scrollWidth,
                behavior: "smooth",
            });

            setIsNewThread(false);
        }

        prevBoardRef.current = threadsView.length;
    }, [threadsView.length]);

    // 기존 카드가 왼쪽으로 밀려나는 효과 (FLIP)
    useLayoutEffect(() => {
        const added = new Set<string>();

        threadsView.forEach(({ thread }) => {
            const el = itemRefs.current.get(thread.id);
            if (!el) return;

            const prevLeft = prevRects.current.get(thread.id);
            const nowLeft = el.offsetLeft;

            if (prevLeft === undefined) {
                // 새 카드: 최초 로딩 때는 제외, 이후 추가분만 등장 애니메이션
                if (knownIds.current.size > 0) added.add(thread.id);
            } else if (prevLeft !== nowLeft) {
                // 기존 카드: 이전 위치로 되돌렸다가 0으로 transition
                const delta = prevLeft - nowLeft;
                el.style.transition = "none";
                el.style.transform = `translateX(${delta}px)`;
                requestAnimationFrame(() => {
                    el.style.transition = "transform 0.3s ease";
                    el.style.transform = "";
                });
            }
        });

        // 현재 위치를 다음 비교를 위해 저장
        prevRects.current.clear();
        threadsView.forEach(({ thread }) => {
            const el = itemRefs.current.get(thread.id);
            if (el) prevRects.current.set(thread.id, el.offsetLeft);
            knownIds.current.add(thread.id);
        });

        if (added.size > 0) {
            setNewIds((prev) => new Set([...prev, ...added]));
        }
    }, [threadsView.length]);

    const handleSelectModel = () => {
        console.log("모델 버튼 클릭");
        setModelSelectOpen(true);
    };

    const handleAddNewModel = (model: ModelInfo) => {
        setIsNewThread(true);
        chatWorkspace.createNewThread(model);
        setModelSelectOpen(false);
    };

    const handleContext = () => {
        console.log("설정 버튼 클릭");
        setHelperOpen(true);
    }

    return (
        <section className={styles.container}>
            <div className={styles.workspace}>
                <div className={styles.header}>
                    <button
                        className={clsx(styles.headerButton, styles.getModel)}
                        onClick={handleSelectModel}
                    >
                        + 모델
                    </button>

                    <button
                        className={clsx(styles.headerButton, styles.getModel)}
                        onClick={handleContext}
                    >
                        설정
                    </button>
                </div>

                <div ref={boardRef} className={styles.threadViewport}>
                    <div className={styles.threadList}>
                        {threadsView.map((thread) => {
                            const id = thread.thread.id;
                            return (
                                <div
                                    key={id}
                                    ref={(el) => {
                                        if (el) itemRefs.current.set(id, el);
                                        else itemRefs.current.delete(id);
                                    }}
                                    className={clsx(
                                        styles.threadItem,
                                        newIds.has(id) && styles.enter,
                                    )}
                                    onAnimationEnd={() =>
                                        setNewIds((prev) => {
                                            if (!prev.has(id)) return prev;
                                            const next = new Set(prev);
                                            next.delete(id);
                                            return next;
                                        })
                                    }
                                >
                                    <Thread threadView={thread} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModelSelectOpen}
                onClose={() => setModelSelectOpen(false)}
            >
                <ModelSelect
                    onClose={() => setModelSelectOpen(false)}
                    onSubmit={handleAddNewModel}
                />
            </Modal>

            <Modal 
            isOpen={isHelperOpen} 
            onClose={() => setHelperOpen(false)}>
                <ChatHelper
                    initial={chatWorkspace.context}
                    onSubmit={chatWorkspace.saveContext}
                    onClose={() => setHelperOpen(false)}
                />
            </Modal>


            <ChatInput
                value={text}
                onChange={setText}
                onSubmit={handleSubmit}
                disabled={isLoading}
            />
        </section>
    );
}

export default ThreadsWorkspace;