'use client';

import { useEffect, useState } from 'react';

import CenterLayout from '@components/containers/CenterLayout';
import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';
import Edit from '@components/pages/post/Edit';

import { Post } from '@prisma/client';
import { CheckIfLoading } from '@components/Loading';
import { AlertType, CheckIfAlert } from '@components/Alert';



export default function Page({ params }: { params: { postId: string } }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [post, setPost] = useState<Post | null>(null);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const fetchPost = async () => {
        const res = await fetch(`/post/${params.postId}/edit/api`, { method: 'GET' });
        const resJson = await res.json();
        
        if (resJson.cStatus==200) setPost(resJson.post);
        else setAlert(resJson);
        setLoading(false);
    }

    useEffect(() => {
        fetchPost();
    }, []);

    return (
        <CenterLayout>
            <CheckIfLoading loading={loading} content={
                <NeedsToBeLoggedIn content={
                    <ExisitngPost post={post as Post} alert={alert} />
                }/>
            }/>
        </CenterLayout>
    );
}


function ExisitngPost({ post, alert }: { post: Post, alert: AlertType | null }) {
    return (
        <CheckIfAlert alert={alert}  content={
            <Edit post={post} />
        }/>
    );
}