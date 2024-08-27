'use client';

import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import formStyles from '@styles/ui/form.module.css';

import CenterLayout from '@components/containers/CenterLayout';
import { Alert, AlertType, AlertVariation } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';



export default function Request() {
    const [loading, setLoading] = useState<boolean>(false);
    const inputs: FormInputType[] = [
        {title: 'Email', type: 'text', name: 'email'}
    ];

    const [alert, setAlert] = useState<AlertType | null>(null);

    const alertVars: AlertVariation[] = [
        {cStatus: 404, jsx: (<p>This account does not exist. Please <a href='./signup'>sign up</a>.</p>)}
    ];

    const attemptRequest = async (formData: FormData) => {
        setLoading(true);
        const userEmail = formData.get('email');
        const res = await fetch(`/password/api`, {
            method: 'POST',
            body: JSON.stringify({ userEmail }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJSON = await res.json();
        setAlert(resJSON);
        setLoading(false);
    }

    return (
        <CheckIfLoading loading={loading} content={
            <div className={formStyles.container}>
                <h2 className={formStyles.title}></h2>
                <Form action={attemptRequest} inputs={inputs} submitTitle='Send reset password email' />
                {alert && <Alert alert={alert} variations={alertVars} />}
            </div>
        }/>
    );
}
