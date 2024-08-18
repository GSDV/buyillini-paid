import VerticalLayout from "@components/containers/VerticalLayout";

export default function Page() {
    return (
        <VerticalLayout>
            <h1>Privacy Policy of BuyIllini</h1>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3>BuyIllini reserves the right to keep your account and post information, including after deletion.</h3>
                <h3>When signing up for BuyIllini, your email address is displayed on your account. If you choose to add a phone number, it will also be displayed on your account. Your email and phone number will also be sent when connecting with a seller.</h3>
                <h3>BuyIllini does not sell or share data with third parties.</h3>
            </div>
        </VerticalLayout>
    );
}