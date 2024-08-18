import { useRouter } from 'next/navigation';

import { Post } from '@prisma/client';
import ViewPost from '@components/pages/post/View';



export default function PayForPost({ post }: { post: Post }) {
    const router = useRouter();

    const goToCheckout = async () => {
        const res = await fetch(`/create/paid/${post.id}/api`, {
            method: 'PUT',
            body: post.id,
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) router.push(resJson.sessionUrl);
    }

    return (
        <div style={{ padding: '20px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', gap: '5px' }} >
                <h1>Confirm your post</h1>
                <h2>You are allowed to edit later</h2>
            </div>

            <ViewPost post={post} />

            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                <button style={{ backgroundColor: 'var(--red)' }} onClick={() => router.push('/create/')}>Back</button>
                <button onClick={goToCheckout}>Checkout</button>
            </div>
        </div>
    );
}