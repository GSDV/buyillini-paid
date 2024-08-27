'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import CenterLayout from '@components/containers/CenterLayout';
import Login from '@components/pages/login/Login';



export default function Page() {
    const router = useRouter();

    const checkIfAlreadyLoggedIn = async () => {
        const res = await fetch(`/login/api`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.cStatus==201) router.push(`/account/${resJson.netId}`);
    }

    useEffect(() => {
        checkIfAlreadyLoggedIn();
    }, []);

    return (
        <CenterLayout>
            <Login />
        </CenterLayout>
    );
}