import Paragraphs from "@components/Paragraphs";
import VerticalLayout from "@components/containers/VerticalLayout";



export default function Page() {
    const paragraphs = [
        "BuyIllini reserves the right to keep your account and post information, including after deletion.",
        "When signing up for BuyIllini, your email address is displayed on your account. If you choose to add a phone number, it will also be displayed on your account. Your email and phone number will also be sent when connecting with a seller.",
        "BuyIllini does not sell or share data with third parties."
    ];

    return (
        <VerticalLayout>
            <h1>Privacy Policy of BuyIllini</h1>
            <Paragraphs paragraphs={paragraphs} />
        </VerticalLayout>
    );
}