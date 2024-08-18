'use client';

import { useEffect, useState } from 'react';

import { Post } from '@prisma/client';

import CenterLayout from '@components/containers/CenterLayout';
import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';
import Loading from '@components/Loading';
import ConfirmPost from '@components/pages/post/Confirm';
import { Alert, AlertType } from '@components/Alert';
import PayForPost from '@components/pages/post/PayForPost';



export default function Page({ params }: { params: { postId: string } }) {
    const [post, setPost] = useState<Post | null>(null);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchDraftedPost = async () => {
        const res = await fetch(`/create/paid/${params.postId}/api/`, { method: 'GET' });
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
            {loading ?
                <Loading />
            :
                <NeedsToBeLoggedIn content={<PostExists post={post as Post} alert={alert} />} />
            }
        </CenterLayout>
    )
}



function PostExists({ post, alert}: { post: Post, alert: AlertType | null }) {
    return (
        <>{!alert ?
            <PayForPost post={post} />
        :
            <Alert alert={alert} variations={[]} />
        }</>
    );
}