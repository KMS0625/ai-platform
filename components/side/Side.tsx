"use client";

// react
import type { ReactNode } from "react";

// css
import styles from "./side.module.css";

// components
import SideItem from "./SideItem";
import { Workspace } from "@/models/Workspace";

type SideProps = {
    selectedId?: string;
    onSelect: (id: string) => void;
    onCreate: () => void;
    newButtonContent?: ReactNode;
    title?: ReactNode;
    footerContent?: ReactNode;
    Workspaces: Workspace[];
    onDelete: (id: string) => void;
    onRename: (id: string, title: string) => Promise<void>;
};

export default function Side({
    Workspaces,
    selectedId,
    onSelect,
    onCreate,
    newButtonContent = "new collection",
    title = "history",
    footerContent = "setting",
    onDelete,
    onRename,
}: SideProps) {

    return (
        <aside className={styles.container}>
            <button className={styles.addButton} onClick={onCreate}>
                {newButtonContent}
            </button>

            <div className={styles.listTitle}>{title}</div>

            <ul className={styles.listContainer}>
                {Workspaces.map((item) => (
                    <SideItem
                        key={item.id}
                        item={item}
                        isActive={item.id === selectedId}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        onRename={onRename}
                    />
                ))}
            </ul>

            <button type="button" className={styles.setting}>
                {footerContent}
            </button>
        </aside>
    );
}
