'use client'

import { useEffect, useState } from 'react';

import Link from 'next/link';

import VerticalLayout from '@components/containers/VerticalLayout';
import CreateSuperPost from '@components/pages/post/SuperPost';
import { Alert, AlertType } from '@components/Alert';
import { Post } from '@prisma/client';
import Loading from '@components/Loading';


// Do not fetch a drafted post. All super posts will be activated immediately.
export default function Page() {
    const [loading, setLoading] = useState<boolean>(false);
    const [draftedPost, setPost] = useState<Post | null>(null);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [postId, setPostId] = useState<string>('');
    
    // const action = async (postData: FormData) => {
    //     postData.set('postId', (draftedPost as any).id);
    //     const res = await fetch(`/admin/posts/super/api/`, {
    //         method: 'POST',
    //         body: postData,
    //     });
    //     const resJson = await res.json();
    //     if (resJson.cStatus==200) {
    //         setPostId(`/post/${resJson.postId}`);
    //     }
    //     setAlert(resJson);
    // }

    return (
        <VerticalLayout>
            {loading ?
                <Loading />
            :
                <>
                {alert && <Alert alert={alert} variations={[]} />}
                    {postId!='' && <h4><b>LINK: </b> <Link href={postId}>postId</Link></h4>}
                    <h3>Create Super Post</h3>
                    {draftedPost && <CreateSuperPost />}
                </>
            }
        </VerticalLayout>
    )
}