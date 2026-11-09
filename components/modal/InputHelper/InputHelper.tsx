import { useState } from "react";
import styles from "./input.module.css";

type InputHelperProps = {
    title: string;
    description: string;
    placeholder?: string;
    defaultValue?: string;
    onClose: () => void;
    onSubmit: (value: string) => void;
};

function InputHelper({
    title,
    description,
    placeholder,
    defaultValue = "",
    onClose,
    onSubmit,
}: InputHelperProps) {
    const [input, setInput] = useState(defaultValue);

    const handleSubmit = () => {
        const value = input.trim();
        if (!value) return;

        onSubmit(value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ×
                </button>
            </div>

            <p className={styles.description}>{description}</p>

            <input
                className={styles.input}
                value={input}
                placeholder={placeholder}
                onChange={(e) => setInput(e.target.value)}
            />

            <div className={styles.actions}>
                <button
                    type="button"
                    className={`${styles.button} ${styles.cancelButton}`}
                    onClick={onClose}
                >
                    취소
                </button>

                <button
                    type="button"
                    className={`${styles.button} ${styles.deleteButton}`}
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                >
                    입력
                </button>
            </div>
        </div>
    );
}

export default InputHelper;