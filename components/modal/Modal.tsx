import { useEffect } from "react";
import styles from "./modal.module.css";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

function Modal({isOpen, onClose, children}: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);


    if (!isOpen)
    return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <section 
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}>
                {children}
            </section>
        </div>
    )
}

export default Modal;  