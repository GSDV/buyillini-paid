'use client';

import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import formStyles from '@styles/ui/form.module.css';

import { Alert, AlertType, AlertVariation } from '@components/Alert';



export default function SendVerification() {
    const [alert, setAlert] = useState<AlertType | null>(null);
    const alertVars: AlertVariation[] = [
        {cStatus: 404, jsx: (<p>This account does not exist. Please <a href='./signup'>sign up</a>.</p>)}
    ];

    const inputs: FormInputType[] = [
        {title: 'Email:', name: 'email', type: 'text'}
    ];

    const attemptSendVerification = async (formData: FormData) => {
        const email = formData.get('email');
        const res = await fetch(`/activate/api`, {
            method: 'POST',
            body: JSON.stringify({email}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={formStyles.container}>
            <h2 className={formStyles.title}>To activate your account, please verify your email.</h2>
            <Form action={attemptSendVerification} inputs={inputs} submitTitle='Send Verification Email' />
            {alert && <Alert alert={alert} variations={alertVars} />}
        </div>
    );
}