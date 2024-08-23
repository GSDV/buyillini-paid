// Need own api route for super post because it uses form data with images
'use client'

import { useEffect, useState } from 'react';

import Link from 'next/link';

import VerticalLayout from '@components/containers/VerticalLayout';
import CreateSuperPost from '@components/pages/post/SuperPost';
import { Alert, AlertType } from '@components/Alert';
import { Post } from '@prisma/client';



export default function Page() {
    const [draftedPost, setPost] = useState<Post | null>(null);
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


    const fetchDrafted = async () => {
        const res = await fetch(`/create/api`, { method: 'GET' });
        const resJson = await res.json();
        setPost(resJson.draftedPost);
    }


    useEffect(() => {
        fetchDrafted();
    }, [])

    return (
        <VerticalLayout>
            {alert && <Alert alert={alert} variations={[]} />}
                {postId!='' && <h4><b>LINK: </b> <Link href={postId}>postId</Link></h4>}
                <h3>Create Super Post</h3>
                <CreateSuperPost action={action} draftedPost={draftedPost as Post} />
        </VerticalLayout>
    )
}