import Link from 'next/link';

import footerStyles from '@styles/ui/footer.module.css';



export default function Footer() {
    return (
        <div className={footerStyles.footer}>
            <h4 className={footerStyles.footerText}>This site is not affiliated with the University of Illinois.</h4>
            <h5 className={footerStyles.footerSubtitle}>By using BuyIllini, you agree to the <Link href='/terms-and-conditions/' target='_blank'>Terms and Conditions</Link> and the <a href='/privacy-policy/' target='_blank'>Privacy Policy</a>.</h5>
        </div>
    );
}