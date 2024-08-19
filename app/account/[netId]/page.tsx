'use client';

import { useEffect, useState } from 'react';

import { RedactedUserWithPosts } from '@util/prisma/types';

import Loading from '@components/Loading';

import CenterLayout from '@components/containers/CenterLayout';
import { Alert, AlertType } from '@components/Alert';
import Account from '@components/pages/account/Account';



export default function Page({ params }: { params: { netId: string } }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<RedactedUserWithPosts | null>(null);
    const [ownAccount, setOwnAccount] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const fetchUserData = async () => {
        setLoading(true);
        console.log("params: ", params);
        console.log("params netId: ", params.netId);
        const res = await fetch(`/account/${params.netId}/api/`, { method: 'GET' });
        const resJson = await res.json();

        if (resJson.cStatus==200 || resJson.cStatus==202) {
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
        <>
            {loading ? 
                <Loading />
            :
                <>{alert ?
                    <CenterLayout>
                        <Alert alert={alert} variations={[]} />
                    </CenterLayout>
                :
                    <>{user!=null && <Account user={user} ownAccount={ownAccount} /> }</>
                }</>
            }
        </>
    );
}