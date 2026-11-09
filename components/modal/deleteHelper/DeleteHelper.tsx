import styles from "./delete.module.css";

type DeleteHelperProps = {
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: () => void;
};

function DeleteHelper({
  title,
  description,
  onClose,
  onSubmit,
}: DeleteHelperProps) {
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
          onClick={onSubmit}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default DeleteHelper;