import { useRouter } from 'next/navigation';

import { Post } from '@prisma/client';
import ViewPost from '@components/pages/post/View';



export default function ConfirmPost({ post }: { post: Post }) {
    const router = useRouter();

    const confirmPost = async () => {
        const res = await fetch(`/create/free/${post.id}/api`, {
            method: 'PUT',
            body: post.id,
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200 || resJson==201) router.push(`/post/${resJson.postId}/`);
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
                <button onClick={confirmPost}>Confirm</button>
            </div>
        </div>
    );
}