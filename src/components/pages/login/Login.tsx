'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import Form, { FormInputType } from '@components/Form';
import { Alert, AlertType, AlertVariation } from '@components/Alert';

import formStyles from '@styles/ui/form.module.css';



export default function Login() {
    const router = useRouter();

    const inputs: FormInputType[] = [
        {title: 'Name', type: 'text', name: 'displayName'},
        {title: 'Email', type: 'text', name: 'email'},
        {title: 'Password', type: 'password', name: 'password'},
        {title: 'Confirm Password', type: 'password', name: 'confirmPassword'}
    ];

    const [alert, setAlert] = useState<AlertType | null>(null);

    const alertVars: AlertVariation[] = [
        {cStatus: 405, jsx: (<p>This account already exists. Please <a href='./login'>log in</a>.</p>)}
    ];

    const attemptSignUp = async (formData: FormData) => {
        if (formData.get('password') !== formData.get('confirmPassword')) {
            setAlert({cStatus: 102, msg: `Passwords don't match.`})
            return;
        }

        const userData = {
            displayName: formData.get('displayName'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        const res = await fetch('signup/api/', {
            method: 'POST',
            body: JSON.stringify({userData}),
            headers: { 'Content-Type': 'application/json' }
        });

        const resJson = await res.json();
        setAlert(resJson);
        if (resJson.cStatus==200) router.push(`/signup/success`);
    }

    return (
        <div className={formStyles.container}>
            <h2 className={formStyles.title}>Sign up for BuyIllini</h2>
            <Form action={attemptSignUp} inputs={inputs} submitTitle='Sign up' />
            {alert && <Alert alert={alert} variations={alertVars} />}
        </div>
    );
}