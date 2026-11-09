import styles from "./EmptyState.module.css";

type EmptyLayoutProps = {
    children: React.ReactNode;
};

function EmptyLayout({
    children,
}: EmptyLayoutProps) {

    return (
        <div className={styles.container}>
            {children}
        </div>
    )
}

export default EmptyLayout;