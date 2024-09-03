'use client';

import { useEffect, useState } from 'react';

import { RedactedUser, RedactedUserWithPosts } from '@util/prisma/types';

import Loading, { CheckIfLoading } from '@components/Loading';

import { AlertType, CheckIfAlert } from '@components/Alert';
import Account from '@components/pages/account/Account';
import VerticalLayout from '@components/containers/VerticalLayout';



export default function Page({ params }: { params: { netId: string } }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<RedactedUserWithPosts | null>(null);
    const [ownAccount, setOwnAccount] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const fetchUserData = async () => {
        setLoading(true);
        const res = await fetch(`/account/${params.netId}/api/`, { method: 'GET' });
        const resJson = await res.json();

        if (resJson.cStatus==200 || resJson.cStatus==202 || resJson.cStatus==205) {
            setUser(resJson.userData);
            setOwnAccount(resJson.cStatus==202);
        } else {
            setAlert(resJson);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <CheckIfLoading loading={loading} content={
            <VerticalLayout>
                <CheckIfAlert alert={alert} content={
                    <Account user={user as RedactedUser} ownAccount={ownAccount} />
                } />
            </VerticalLayout>
        } />
    );
}
