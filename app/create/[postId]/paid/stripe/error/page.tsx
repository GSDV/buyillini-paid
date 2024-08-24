import VerticalLayout from '@components/containers/VerticalLayout';



export default function Page({ params }: { params: { postId: string } }) {
    return (
        <VerticalLayout>
            <h3>Error.</h3>
            <p>Something went wrong during Stripe payment.</p>
        </VerticalLayout>
    );
}