import Paragraphs from "@components/Paragraphs";
import VerticalLayout from "@components/containers/VerticalLayout";



export default function Page() {
    const paragraphs = [
        "By signing up for BuyIllini, you confirm that you are at least 18 years old.",
        "BuyIllini is not affiliated with the University of Illinois.",
        "BuyIllini refers to a “month” as a period of exactly 30 days. “Months” are multiple of these periods.",
        "BuyIllini exists as a platform to show items for sale and connect buyers to sellers. Actual transactions occur outside of BuyIllini.",
        "BuyIllini is not responsible for purchases made. BuyIllini cannot verify authenticity, quality, or condition of sold items.",
        "BuyIllini reserves the right to delete a post at any time for any reason. Reasons include, but are not limited to: spam posts, vulgar language, inappropriate or unrelated pictures, and selling counterfeit or stolen items. BuyIllini also reserves the right to delete or make inactive accounts at any time for any reason, even if the account has an active post.",
        "A seller on BuyIllini buys a post to display on the website for a set amount of months. Each post costs $1.00 per month. BuyIllini is not a subscription service; each post’s duration is set at the time of creation and cannot be changed. Sellers are charged for the total duration of the post at the post's creation.",
        "The seller is allowed to use the same post to sell two different items, so long as it is not at the same time.",
        "A seller on BuyIllini may use “free months” to create a free or discounted post. The amount of free months used are subtracted from the total duration of the post, leaving only the remainder to be paid. Free months are gained through account creation or promo code redemption."
    ];

    return (
        <VerticalLayout>
            <h1>Terms and Conditions of BuyIllini</h1>
            <Paragraphs paragraphs={paragraphs} />
        </VerticalLayout>
    );
}