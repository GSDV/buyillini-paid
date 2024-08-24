import { useRouter } from 'next/navigation';

import ViewPost from '@components/pages/post/View';
import { Alert, AlertType } from '@components/Alert';

import { Post } from '@prisma/client';



interface ConfirmPostType {
    post: Post,
    confirmPostAction: ()=>void,
    alert: AlertType | null
}

export default function ConfirmPost({ post, confirmPostAction, alert }: ConfirmPostType) {
    const router = useRouter();
    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', alignItems: 'center', gap: '5px' }} >
                <h1>Confirm your post</h1>
                <h2>You are allowed to edit later</h2>
                {alert && <Alert alert={alert} variations={[]} />}
            </div>
            <ViewPost post={post} />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                <button style={{ backgroundColor: 'var(--red)' }} onClick={() => router.push('/create/')}>Back</button>
                <button onClick={confirmPostAction}>Confirm</button>
            </div>
        </>
    );
}