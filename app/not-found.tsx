'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import CenterLayout from '@components/containers/CenterLayout';



export default function Page() {
    const router = useRouter();

    useEffect(() => {
        router.push('/');
    }, []);

    return (
        <CenterLayout>
            <h1>Page not found</h1>
        </CenterLayout>
    );
}