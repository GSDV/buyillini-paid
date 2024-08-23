'use client';

import { useEffect, useState } from 'react';

import CenterLayout from '@components/containers/CenterLayout';
import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';
import Create from '@components/pages/post/Create';

import { Post } from '@prisma/client';
import Loading from '@components/Loading';



export default function Page() {
    const [loading, setLoading] = useState<boolean>(true);
    const [freeMonths, setFreeMonths] = useState<number>(0);
    const [pastPost, setPastPost] = useState<Post | null>(null);

    const fetchFreeMonthsAndDraftedPost = async () => {
        const res = await fetch(`/create/api/`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            setFreeMonths(resJson.freeMonths);
            setPastPost(resJson.draftedPost);
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
                <NeedsToBeLoggedIn content={<Create freeMonths={freeMonths} draftedPost={pastPost as Post} />} />
            }
        </CenterLayout>
    )
}