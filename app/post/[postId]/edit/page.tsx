'use client';

import { useEffect, useState } from 'react';

import CenterLayout from '@components/containers/CenterLayout';
import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';
import Edit from '@components/pages/post/Edit';

import { Post } from '@prisma/client';
import Loading from '@components/Loading';
import { imgUrl } from '@util/global';
import { Alert, AlertType } from '@components/Alert';
import Create from '@components/pages/post/Create';



export default function Page({ params }: { params: { postId: string } }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [post, setPost] = useState<Post | null>(null);
    const [postImages, setPostImages] = useState<File[]>([]);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const fetchPost = async () => {
        const res = await fetch(`/post/${params.postId}/edit/api`, { method: 'GET' });
        const resJson = await res.json();
        
        setAlert(resJson);
        if (resJson.cStatus==200) {
            setPost(resJson.post);
            console.log("post", resJson.post)

            const imgFiles: File[] = [];
            if (resJson.post!=null) {
                const imgs = resJson.post.images;
                for (let i=0; i<imgs.length; i++) {
                    const response = await fetch(imgUrl(imgs[i]));
                    const blob = await response.blob();
                    const file = new File([blob], `image`, { type: blob.type });
                    imgFiles.push(file);
                }
            }

            setPostImages(imgFiles);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchPost();
    }, []);

    return (
        <CenterLayout>
            {loading ?
                <Loading />
            :
                <NeedsToBeLoggedIn content={<ExisitngPost post={post as Post} postImages={postImages} alert={alert} />} />
            }
                <NeedsToBeLoggedIn content={<Create pastPost={post} freeMonths={0} pastImages={postImages} />} />
            {/* <NeedsToBeLoggedIn content={<ExisitngPost post={post as Post} postImages={postImages} alert={alert} />} /> */}
        </CenterLayout>
    )
}


function ExisitngPost({ post, postImages, alert }: { post: Post, postImages: File[], alert: AlertType | null }) {
    return (
        <>{(alert && alert.cStatus!=200) ?
            <Alert alert={alert} variations={[]} />
        :
            <Edit post={post} postImages={postImages} />
        }</>
    );
}