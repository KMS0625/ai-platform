"use client"
import styles from "./chatInput.module.css";
import AutoResizeTextarea from "../autoResizeTextarea/AutoResizeTextarea";

import { forwardRef, type KeyboardEvent } from "react";
import clsx from "clsx";

type ChatInputProps = {
    value: string;
    onChange: (text: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    isWaiting: boolean,
}

function ChatInput({
    value, 
    onChange,
    onSubmit,
    disabled = false,
    isWaiting,
}: ChatInputProps) {
    const isEmpty = value.trim() === "";
    const canSubmit = !isEmpty && !disabled;

    const handleSubmit = () => {
        if (isEmpty && !isWaiting)
            return;
        onSubmit();
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!canSubmit)
            return;

        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            console.log("Enter pressed", {
                disabled,
                isEmpty,
                canSubmit,
            });
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <section className={styles.container}>
            <div className={styles.textArea}>
                <AutoResizeTextarea
                className={styles.inputWrapper}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                />
            </div>
            
            <div className={styles.buttonRow}>
                <button
                    className={clsx(
                        styles.submitButton,
                        (isWaiting || !isEmpty) 
                        && styles.active
                    )}
                    onClick={handleSubmit}
                    disabled={isEmpty}
                >
                    {"↑"}
                </button>
            </div>
        </section>
    )
}

//isWaiting ? "◼" : 

export default ChatInput;