'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useReloaderContext } from '@components/providers/Reloader';

import Form, { FormInputType } from '@components/Form';
import { Alert, AlertType, AlertVariation } from '@components/Alert';

import formStyles from '@styles/ui/form.module.css';



export default function Login() {
    const router = useRouter();
    const { reload } = useReloaderContext();

    const inputs: FormInputType[] = [
        {title: 'Email', type: 'text', name: 'email'},
        {title: 'Password', type: 'password', name: 'password'}
    ];

    const [alert, setAlert] = useState<AlertType | null>(null);
    const alertVars: AlertVariation[] = [
        {cStatus: 412, jsx: (<p>This account is not active. Please <a href='/activate'>activate</a> it.</p>)},
        {cStatus: 403, jsx: (<p>Wrong passowrd. If you forgot your password, you can <a href='/password'>reset it</a>.</p>)}
    ];

    const attemptLogin = async (formData: FormData) => {
        const userData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        const res = await fetch('login/api/', {
            method: 'POST',
            body: JSON.stringify({userData}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
        if (resJson.cStatus==200) {
            reload();
            router.push(`/account/${resJson.netId}`);
        }
    }

    return (
        <div className={formStyles.container}>
            <h2 className={formStyles.title}>Login</h2>
            <Form action={attemptLogin} inputs={inputs} submitTitle='Login' />
            {alert && <Alert alert={alert} variations={alertVars} />}
        </div>
    );
}