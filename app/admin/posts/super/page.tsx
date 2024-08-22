// Need own api route for super post because it uses form data with images
'use client'

import { useState } from 'react';

import Link from 'next/link';

import VerticalLayout from '@components/containers/VerticalLayout';
import CreateSuperPost from '@components/pages/post/SuperPost';
import { Alert, AlertType } from '@components/Alert';



export default function Page() {
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [postId, setPostId] = useState<string>('');
    
    const action = async (postData: FormData) => {
        const res = await fetch(`/admin/posts/super/api/`, {
            method: 'POST',
            body: postData,
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            setPostId(`/post/${resJson.postId}`);
        }
        setAlert(resJson);
    }

    return (
        <VerticalLayout>
            {alert && <Alert alert={alert} variations={[]} />}
                {postId!='' && <h4><b>LINK: </b> <Link href={postId}>postId</Link></h4>}
                <h3>Create Super Post</h3>
                <CreateSuperPost action={action} />
        </VerticalLayout>
    )
}