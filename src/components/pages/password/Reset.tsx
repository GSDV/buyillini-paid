'use client';

import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import formStyles from '@styles/ui/form.module.css';

import { Alert, AlertType } from '@components/Alert';
import { useRouter } from 'next/navigation';
import { CheckIfLoading } from '@components/Loading';



export default function Reset({ rpToken }: { rpToken: string }) {
    const router = useRouter();
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const inputs: FormInputType[] = [
        {title: 'New Password', type: 'password', name: 'password'},
        {title: 'Confirm New Password', type: 'password', name: 'confirm'},
    ];

    const attemptRequest = async (formData: FormData) => {
        setLoading(true);
        const newPassword = formData.get('password');
        const confirm = formData.get('confirm');
        if (newPassword != confirm) {
            setAlert({cStatus: 102, msg: `The passwords you entered do not match.`});
            return;
        }

        const res = await fetch(`/password/${rpToken}/api`, {
            method: 'POST',
            body: JSON.stringify({ newPassword }),
            headers: { 'Content-Type': 'application/json' }
        });

        const resJSON = await res.json();
        if (resJSON.cStatus==200) router.push(`/login`);
        setAlert(resJSON);
        setLoading(false);
    }

    return (
        <CheckIfLoading loading={loading} content={
            <div className={formStyles.container}>
                <h2 className={formStyles.title}></h2>
                <Form action={attemptRequest} inputs={inputs} submitTitle='Reset password' />
                {alert && <Alert alert={alert}  />}
            </div>
        } />
    );
}
