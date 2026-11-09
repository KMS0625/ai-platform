"use client"

import EmptyLayout from "./EmptyLayout";

import styles from "./noteEmpryState.module.css";
import { useNoteWorkspaceContext } from "@/context/NotespaceContextx";

export default function NoteEmpryState() {
    const { noteWorkspace: { createNote, pages } } = useNoteWorkspaceContext();

    const handleClick = () => {
        try {
            createNote();
        } catch (e) {
            console.log("faild to create note");
        }
    };


    return (
        <EmptyLayout>
            <div className={styles.app}>
                <div className={styles.title}>선택된 노트가 없습니다.</div>
                <div className={styles.description}>노트 선택하거나 새로 만들어 보세요</div>
                <button className={styles.new} onClick={handleClick}>새로운 노트 만들기</button>
            </div>
        </EmptyLayout>
    );
}