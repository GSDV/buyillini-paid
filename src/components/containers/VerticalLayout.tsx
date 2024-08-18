import styles from '@styles/layout.module.css'



export default function VerticalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.vertical}>
            {children}
        </div>
    );
}