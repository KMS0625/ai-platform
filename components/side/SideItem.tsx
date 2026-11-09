

import type { Collection } from "@/types/Collection";

// lib
import clsx from "clsx";

// css
import styles from "./side.module.css";
import { Workspace } from "@/models/Workspace";
import { useChatWorkspaceContext } from "@/context/ChatspaceContext";
import { useState } from "react";
import Modal from "../modal/Modal";
import DeleteHelper from "../modal/deleteHelper/DeleteHelper";

type SdieItemProps = {
    item: Workspace;
    isActive: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

function SideItem({
    item,
    isActive,
    onSelect,
    onDelete,
}: SdieItemProps) {
    const [isDeleteOpen, setIsDeletOpen] = useState(false);

    const handleDelete = () => {
        setIsDeletOpen(false);
        onDelete(item.id);
    }

    return (
        <li className={clsx(styles.item, isActive && styles.selected)} onClick={() => onSelect(item.id)}>
            <span className={styles.itemTitle}>
                {item.title}
            </span>
            <button className={styles.deleteButton} onClick={(e) => {e.stopPropagation(); setIsDeletOpen(true)}}>
                x
            </button>

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