'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import CenterLayout from '@components/containers/CenterLayout';
import SignUp from '@components/pages/signup/SignUp';



export default function Page() {
    const router = useRouter();

    const checkIfAlreadyLoggedIn = async () => {
        const res = await fetch(`/signup/api`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.cStatus==201) router.push(`/account/${resJson.netId}`);
    }

    useEffect(() => {
        checkIfAlreadyLoggedIn();
    }, []);

    return (
        <CenterLayout>
            <SignUp />
        </CenterLayout>
    );
}