'use client';

import { useEffect, useState } from 'react';

import CenterLayout from '@components/containers/CenterLayout';
import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';
import Create from '@components/pages/post/Create';

import { Post } from '@prisma/client';
import Loading from '@components/Loading';
import { imgUrl } from '@util/global';



export default function Page() {
    const [loading, setLoading] = useState<boolean>(true);
    const [freeMonths, setFreeMonths] = useState<number>(0);
    const [pastPost, setPastPost] = useState<Post | null>(null);
    const [pastImages, setPastImages] = useState<File[]>([]);

    const fetchFreeMonthsAndDraftedPost = async () => {
        const res = await fetch(`/create/api/`, { method: 'GET' });
        const resJson = await res.json();
        console.log("resJson: ", resJson)
        if (resJson.cStatus==200) {
            setFreeMonths(resJson.freeMonths);
            setPastPost(resJson.draftedPost);

            const imgFiles: File[] = [];
            if (resJson.draftedPost!=null) {
                const imgs = resJson.draftedPost.images;
                for (let i=0; i<imgs.length; i++) {
                    const response = await fetch(imgUrl(imgs[i]));
                    const blob = await response.blob();
                    const file = new File([blob], `image`, { type: blob.type });
                    imgFiles.push(file);
                }
            }
            
            setPastImages(imgFiles);
            setLoading(false);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchFreeMonthsAndDraftedPost();
    }, []);

    return (
        <CenterLayout>
            {loading ?
                <Loading />
            :
                <NeedsToBeLoggedIn content={<Create freeMonths={freeMonths} pastPost={pastPost} pastImages={pastImages} />} />
            }
        </CenterLayout>
    )
}