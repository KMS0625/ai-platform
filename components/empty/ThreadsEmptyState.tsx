// ChatEmptyState.tsx
"use client";

import { useState } from "react";

import EmptyLayout from "./EmptyLayout";

import Modal from "@/components/modal/Modal";
import ModelSelect from "@/components/modal/modelSelect/ModelSelect";

import { useChatWorkspaceContext } from "@/context/ChatspaceContext";
import { ModelInfo } from "@/lib/models";

import styles from "./threadsEmpty.module.css";
import { usePathname } from "next/navigation";
import { getEmptyConfig, Section } from "@/constants/section";


export default function ThreadsEmptyState() {
    const [open, setOpen] = useState(false);
    const { chatWorkspace } = useChatWorkspaceContext();

    const pathname = usePathname();
    const section = pathname.split("/")[1] as Section;
    const { title, description, label } = getEmptyConfig(section);

    const handleSubmit = (model: ModelInfo) => {
        console.log("새로운 채팅 시작");
        chatWorkspace.createNewWorkspace(model);
        setOpen(false);
    };

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <EmptyLayout>
            <div className={styles.title}>{title}</div>
            <div className={styles.description}>{description}</div>
            <button className={styles.new} onClick={() => setOpen(true)}>{label}</button>
            <Modal isOpen={open} onClose={handleClose}>
                <ModelSelect onClose={handleClose} onSubmit={handleSubmit}></ModelSelect>
            </Modal>
        </EmptyLayout>
    );
}