'use client'

import { Alert, AlertType } from '@components/Alert';
import Loading from '@components/Loading';
import VerticalLayout from '@components/containers/VerticalLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';



export default function Page({ params }: { params: { postId: string } }) {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType | null>(null);
    
    const checkIfPaid = async () => {
        setLoading(true);
        const res = await fetch(`/create/paid/${params.postId}/stripe/api`, { method: 'POST' });
        const resJson = await res.json();
        setAlert(resJson);
        if (resJson.cStatus==200) router.push(`/post/${params.postId}/`);
        setLoading(false);
    }

    useEffect(() => {
        checkIfPaid();
    }, []);

    return (
        <VerticalLayout>
            {loading ?
                <Loading />
            :
                <>
                    <h3>Success!</h3>
                    {alert && <Alert alert={alert} />}
                </>
            }
        </VerticalLayout>
    );
}