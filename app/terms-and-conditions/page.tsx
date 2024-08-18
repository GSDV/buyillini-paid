import VerticalLayout from "@components/containers/VerticalLayout";

export default function Page() {
    return (
        <VerticalLayout>
            <h1>Terms and Conditions of BuyIllini</h1>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3>By signing up for BuyIllini, you confirm that you are at least 18 years old.</h3>
                <h3>BuyIllini is not affiliated with the University of Illinois.</h3>
                <h3>BuyIllini refers to a “month” as a period of exactly 30 days. “Months” are multiple of these periods.</h3>
                <h3>BuyIllini exists as a platform to show items for sale and connect buyers to sellers. Actual transactions occur outside of BuyIllini.</h3>
                <h3>BuyIllini is not responsible for purchases made. BuyIllini cannot verify authenticity, quality, or condition of sold items.</h3>
                <h3>BuyIllini reserves the right to delete a post at any time for any reason. Reasons include, but are not limited to: spam posts, vulgar language, inappropriate or unrelated pictures, and selling counterfeit or stolen items. BuyIllini also reserves the right to delete or make inactive accounts at any time for any reason, even if the account has an active post.</h3>
                <h3>A seller on BuyIllini buys a post to display on the website for a set amount of months. Each post costs $1.00 per month. BuyIllini is not a subscription service; each post’s duration is set at the time of creation and cannot be changed. Sellers are charged for the total duration of the post at the post's creation.</h3>
                <h3>The seller is allowed to use the same post to sell two different items, so long as it is not at the same time.</h3>
                <h3>A seller on BuyIllini may use “free months” to create a free or discounted post. The amount of free months used are subtracted from the total duration of the post, leaving only the remainder to be paid. Free months are gained through account creation or promo code redemption.</h3>
            </div>
        </VerticalLayout>
    );
}