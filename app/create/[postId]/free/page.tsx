'use client';

import { useEffect, useState } from 'react';

import { Post } from '@prisma/client';

import CenterLayout from '@components/containers/CenterLayout';
import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';
import { CheckIfLoading } from '@components/Loading';
import ConfirmFreePost from '@components/pages/post/confirm/Free';
import { AlertType, CheckIfAlert } from '@components/Alert';



export default function Page({ params }: { params: { postId: string } }) {
    const [post, setPost] = useState<Post | null>(null);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchDraftedPost = async () => {
        const res = await fetch(`/create/${params.postId}/api/free`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.cStatus==200) setPost(resJson.draftedPost);
        else setAlert(resJson);
        setLoading(false);
    }

    useEffect(() => {
        fetchDraftedPost();
    }, []);

    return (
        <CenterLayout>
            <CheckIfLoading loading={loading} content={
                <NeedsToBeLoggedIn content={
                    <PostExists post={post as Post} alert={alert} />
                } />
            } />
        </CenterLayout>
    )
}



function PostExists({ post, alert}: { post: Post, alert: AlertType | null }) {
    return (
        <CheckIfAlert alert={alert} content={
            <ConfirmFreePost post={post} />
        } />
    );
}