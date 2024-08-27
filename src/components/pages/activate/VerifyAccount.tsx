'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Loading from '@components/Loading';

import { Alert, AlertType, AlertVariation } from '@components/Alert';



export default function VerifyAccount({ activateToken }: { activateToken: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    const [alert, setAlert] = useState<AlertType | null>(null);
    const alertVars: AlertVariation[] = [
        {cStatus: 502, jsx: (<p>This activation link is expired. Please <a href='/activate/'>request a new one</a>.</p>)}
    ];
    
    const attemptActivate = async () => {
        setLoading(true);
        const res = await fetch(`/activate/${activateToken}/api`, {
            method: 'POST'
        });
        const resJson = await res.json();
        if (resJson.cStatus==200 || resJson.cStatus==201) {
            router.push(`/account/${resJson.netId}`);
        } else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    useEffect(() => {
        attemptActivate();
    }, []);

    return (
        <>{loading ?
            <div>
                <h2>Your account is about to be activated.</h2>
                <Loading />
            </div>
        :
            <>{alert && <Alert alert={alert} variations={alertVars} />}</>
        }</>
    );
}