import styles from '@styles/layout.module.css';



export default function CenterLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.center}>
            {children}
        </div>
    );
}