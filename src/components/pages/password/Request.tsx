'use client';

import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import formStyles from '@styles/ui/form.module.css';

import { Alert, AlertType, AlertVariation } from '@components/Alert';



export default function Request() {
    const inputs: FormInputType[] = [
        {title: 'Email', type: 'text', name: 'email'}
    ];

    const [alert, setAlert] = useState<AlertType | null>(null);

    const alertVars: AlertVariation[] = [
        {cStatus: 404, jsx: (<p>This account does not exist. Please <a href='./signup'>sign up</a>.</p>)}
    ];

    const attemptRequest = async (formData: FormData) => {
        const userEmail = formData.get('email');
        const res = await fetch('/password/api/', {
            method: 'POST',
            body: JSON.stringify({ userEmail }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJSON = await res.json();
        setAlert(resJSON);
    }

    return (
        <div className={formStyles.container}>
            <h2 className={formStyles.title}></h2>
            <Form action={attemptRequest} inputs={inputs} submitTitle='Send reset password email' />
            {alert && <Alert alert={alert} variations={alertVars} />}
        </div>
    );
}
