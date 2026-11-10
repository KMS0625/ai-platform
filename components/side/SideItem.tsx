


// lib
import clsx from "clsx";

// css
import styles from "./side.module.css";
import { Workspace } from "@/models/Workspace";
import { useState } from "react";
import Modal from "../modal/Modal";
import DeleteHelper from "../modal/deleteHelper/DeleteHelper";
import InputHelper from "../modal/InputHelper/InputHelper";

type SdieItemProps = {
    item: Workspace;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, title: string) => Promise<void>;
}

function SideItem({
    item,
    isActive,
    onSelect,
    onDelete,
    onRename,
}: SdieItemProps) {
    const [isDeleteOpen, setIsDeletOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    const handleDelete = () => {
        setIsDeletOpen(false);
        onDelete(item.id);
    }

    return (
        <li className={clsx(styles.item, isActive && styles.selected)} onClick={() => {
            if (!isDeleteOpen && !isRenameOpen) onSelect(item.id);
        }}>
            <span className={styles.itemTitle}>
                {item.title}
            </span>
            <button type="button" className={clsx(styles.deleteButton, styles.renameButton)}
                title="변경" aria-label={`${item.title} 이름 변경`}
                onClick={(e) => { e.stopPropagation(); setIsRenameOpen(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m16 3 5 5M4 15l12-12a2 2 0 0 1 5 5L9 20l-6 1 1-6Z" />
                </svg>
            </button>
            <button type="button" className={styles.deleteButton} title="삭제" aria-label={`${item.title} 삭제`} onClick={(e) => {e.stopPropagation(); setIsDeletOpen(true)}}>
                x
            </button>

            <Modal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)}>
                <InputHelper
                    title="이름 변경"
                    description="새로운 제목을 입력하세요."
                    placeholder="제목"
                    defaultValue={item.title}
                    submitLabel="변경"
                    onClose={() => setIsRenameOpen(false)}
                    onSubmit={(title) => onRename(item.id, title)}
                />
            </Modal>

            <Modal 
            isOpen={isDeleteOpen} 
            onClose={() => setIsDeletOpen(false)}
            >
                <DeleteHelper 
                title={item.title}
                description={"삭제하면 복구할 수 없습니다."}
                onClose={() => setIsDeletOpen(false)}
                onSubmit={handleDelete}
                />
            </Modal>
        </li>
    );
}

export default SideItem;
