import { useRef, useState } from "react";
import styles from "./input.module.css";

type InputHelperProps = {
    title: string;
    description: string;
    placeholder?: string;
    defaultValue?: string;
    onClose: () => void;
    onSubmit: (value: string) => void | Promise<void>;
    submitLabel?: string;
};

function InputHelper({
    title,
    description,
    placeholder,
    defaultValue = "",
    onClose,
    onSubmit,
    submitLabel = "입력",
}: InputHelperProps) {
    const [input, setInput] = useState(defaultValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const submittingRef = useRef(false);

    const handleSubmit = async () => {
        const value = input.trim();
        if (!value || submittingRef.current) return;
        submittingRef.current = true;
        setIsSubmitting(true);
        setError("");
        try {
            await onSubmit(value);
            onClose();
        } catch {
            setError("저장하지 못했습니다. 다시 시도해 주세요.");
        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.container} onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="닫기"
                    disabled={isSubmitting}
                >
                    ×
                </button>
            </div>

            <p className={styles.description}>{description}</p>

            <input
                aria-label="새로운 제목"
                autoFocus
                className={styles.input}
                value={input}
                placeholder={placeholder}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSubmitting}
            />
            {error && <p className={styles.error} role="alert">{error}</p>}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={`${styles.button} ${styles.cancelButton}`}
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    취소
                </button>

                <button
                    type="submit"
                    className={`${styles.button} ${styles.submitButton}`}
                    disabled={!input.trim() || isSubmitting}
                >
                    {isSubmitting ? "저장 중…" : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default InputHelper;
