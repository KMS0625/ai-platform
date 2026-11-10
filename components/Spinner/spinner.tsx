// components/spinner/Spinner.tsx
import styles from "./spinner.module.css";

export function Spinner() {
    return <div className={styles.spinner} role="status" aria-label="로딩 중" />;
}

export function SpinnerOverlay() {
    return (
        <div className={styles.overlay}>
            <Spinner />
        </div>
    );
}