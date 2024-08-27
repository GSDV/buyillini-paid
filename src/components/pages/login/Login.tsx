'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, AlertType, AlertVariation } from '@components/Alert';

import { useAuthContext } from '@components/providers/Auth';

import formStyles from '@styles/ui/form.module.css';
import { CheckIfLoading } from '@components/Loading';



export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const { fetchCookie } = useAuthContext();

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
        setLoading(true);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        const res = await fetch(`/login/api`, {
            method: 'POST',
            body: JSON.stringify({userData}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            fetchCookie();
            router.push(`/account/${resJson.netId}`);
        } else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    return (
        <CheckIfLoading loading={loading} content={
            <div className={formStyles.container}>
                <h2 className={formStyles.title}>Login</h2>
                <LoginForm action={attemptLogin} inputs={inputs} />
                {alert && <Alert alert={alert} variations={alertVars} />}
            </div>
        }/>
    );
}



interface FormInputType {
    title: string,
    name: string,
    type: React.HTMLInputTypeAttribute
}

interface FormType {
    action: (formData: FormData) => void,
    inputs: FormInputType[]
}

function LoginForm({ action, inputs }: FormType) {
    return (
        <form className={formStyles.form} action={action}>
            {inputs.map((input, i) => { 
                return (
                    <div key={i} className={formStyles.formItem}>
                        <h4>{input.title}</h4> <input type={input.type} name={input.name} autoComplete={input.name} />
                    </div>
                );
            })}

            <div style={{ padding: '20px',  display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{ alignSelf: 'center' }} type='submit'>Login</button>
                <h5 style={{ textAlign: 'center' }}>Click <a href='/signup'>here</a> to sign up</h5>
                <h5 style={{ textAlign: 'center' }}>Click <a href='/password'>here</a> to reset password</h5>
            </div>
        </form>
    );
}