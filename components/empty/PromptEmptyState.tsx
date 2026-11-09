"use client"

import { usePromptWorkspaceContext } from "@/context/PromptspaceContext";
import EmptyLayout from "./EmptyLayout";

import styles from "./prompt.module.css";

export default function NoteEmpryState() {
    const { promptWorkspace: { createPrompt } } = usePromptWorkspaceContext();

    const handleClick = () => {
        try {
            createPrompt();
        } catch (e) {
            console.log("faild to create note");
        }
    };


    return (
        <EmptyLayout>
            <div className={styles.app}>
                <div className={styles.title}> 선택된 프롬프트가 없습니다.</div>
                <div className={styles.description}>프롬프트를 선택하거나 새로 만들어 보세요</div>
                <button className={styles.new} onClick={handleClick}>새로운 프롬프트 만들기</button>
            </div>
        </EmptyLayout>
    );
}