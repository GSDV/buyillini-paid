import footerStyles from '@styles/footer.module.css';



export default function Footer() {
    return (
        <div className={footerStyles.footer}>
            <h4 className={footerStyles.footerText}>This site is not affiliated with the University of Illinois.</h4>
        </div>
    );
}