'use client';

import { useEffect, useState } from 'react';

import CenterLayout from '@components/containers/CenterLayout';
import Loading, { CheckIfLoading } from '@components/Loading';
import DisplayPost from '@components/pages/post/Display';
import { Alert, AlertType, CheckIfAlert } from '@components/Alert';
import { PostWithRedactedUser } from '@util/prisma/types';



export default function Page({ params }: { params: { postId: string } }) {
    const [post, setPost] = useState<PostWithRedactedUser | null>(null);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [cStatus, setCStatus] = useState<number>(400);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPost = async () => {
        const res = await fetch(`/post/${params.postId}/api/`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.cStatus==200 || resJson.cStatus==202 || resJson.cStatus==203) {
            setCStatus(resJson.cStatus);
            setPost(resJson.post);
        }
        else {
            setAlert(resJson);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchPost();
    }, []);

    return (
        <CenterLayout>
            <CheckIfLoading loading={loading} content={
                <ChooseView post={post as PostWithRedactedUser} cStatus={cStatus} alert={alert} />
            } />
        </CenterLayout>
    )
}



function ChooseView({ post, cStatus, alert}: { post: PostWithRedactedUser, cStatus: number, alert: AlertType | null }) {
    if (!post.deleted) return (
        <CheckIfAlert alert={alert} content={
            <DisplayPost post={post} cStatus={cStatus} />
        } />
    );

    if (post.deleted && cStatus==202) return <DisplayPost post={post} cStatus={cStatus} />;

    return <Alert alert={{cStatus: 400, msg: 'This post has been deleted.'}}  />;
}