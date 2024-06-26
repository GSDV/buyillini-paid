'use client';

import { Alert, AlertType, AlertVariation } from '@components/Alert';
import Loading from '@components/Loading';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function VerifyAccount() {
    const { activateToken } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    const [alert, setAlert] = useState<AlertType | null>(null);
    const alertVars: AlertVariation[] = [
        {cStatus: 502, jsx: (<p>This activation link is expired. Please <a href='/activate/'>request a new one</a>.</p>)}
    ];
    
    const attemptActivate = async (activateToken: string ) => {
        const res = await fetch('/activate/verify/api/', {
            method: 'POST',
            body: JSON.stringify({activateToken}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setLoading(false);
        setAlert(resJson);
        console.log(resJson)
        if (resJson.cStatus==200 || resJson.cStatus==201) router.push(`/account/${resJson.netId}`)
    }

    useEffect(() => {
        if (Array.isArray(activateToken)) {
            setAlert({cStatus: 102, msg: 'You did not provide the right activation code.'})
            return;
        };
        attemptActivate(activateToken);
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