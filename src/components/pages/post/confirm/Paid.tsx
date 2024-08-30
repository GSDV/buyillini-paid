import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { CheckIfLoading } from '@components/Loading';
import ConfirmPost from './Confirm';

import { Post } from '@prisma/client';
import { AlertType } from '@components/Alert';



export default function ConfirmPaidPost({ post }: { post: Post }) {
    const router = useRouter();
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const goToCheckout = async () => {
        setLoading(true);
        const res = await fetch(`/create/${post.id}/api/paid`, {
            method: 'PUT',
            body: post.id,
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(res)
        const resJson = await res.json();
        if (resJson.cStatus==200 || resJson==201) {
            // Send user to stripe checkout
            router.push(resJson.sessionUrl);
        }
        else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: '20px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <CheckIfLoading loading={loading} content={
                <ConfirmPost post={post} confirmPostAction={goToCheckout} alert={alert} />
            }/>
        </div>
    );
}