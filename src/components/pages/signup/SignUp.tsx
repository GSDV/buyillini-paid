'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@components/providers/Auth';

import { Alert, AlertType, AlertVariation } from '@components/Alert';

import formStyles from '@styles/ui/form.module.css';
import { CheckIfLoading } from '@components/Loading';



export default function SignUp() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const { fetchCookie } = useAuthContext();

    const inputs: FormInputType[] = [
        {title: 'Name', type: 'text', name: 'displayName'},
        {title: 'Email', type: 'text', name: 'email'},
        {title: 'Password', type: 'password', name: 'password'},
        {title: 'Confirm Password', type: 'password', name: 'confirmPassword'}
    ];

    const [alert, setAlert] = useState<AlertType | null>(null);
    const alertVars: AlertVariation[] = [
        {cStatus: 405, jsx: (<p>This account already exists. Please <a href='/login'>log in</a>.</p>)}
    ];

    const attemptSignUp = async (formData: FormData) => {
        setLoading(true);
        if (formData.get('password') !== formData.get('confirmPassword')) {
            setAlert({cStatus: 102, msg: `Passwords don't match.`})
            return;
        }

        const userData = {
            displayName: formData.get('displayName'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        const res = await fetch(`/signup/api`, {
            method: 'POST',
            body: JSON.stringify({userData}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            fetchCookie();
            router.push(`/signup/success/`);
        } else {
            setLoading(true);
            setAlert(resJson);
        }
    }

    return (
        <CheckIfLoading loading={loading} content={
            <div className={formStyles.container}>
                <h2 className={formStyles.title}>Sign up for BuyIllini</h2>
                <SignUpForm action={attemptSignUp} inputs={inputs} />
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

function SignUpForm({ action, inputs }: FormType) {
    return (
        <form className={formStyles.form} action={action}>
            {inputs.map((input, i) => { 
                return (
                    <div key={i} className={formStyles.formItem}>
                        <h4>{input.title}</h4> <input type={input.type} name={input.name} autoComplete={input.name} />
                    </div>
                );
            })}

            <h5 style={{ width: '250px', textAlign: 'center' }}>By signing up, you agree to the <a href='/terms-and-conditions/' target='_blank'>Terms</a> and <a href='/privacy-policy/' target='_blank'>Privacy Policy</a> of BuyIllini.</h5>

            <div style={{ padding: '20px',  display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{ alignSelf: 'center' }} type='submit'>Sign up</button>
                <h5 style={{ textAlign: 'center' }}>Click <a href='/login/'>here</a> to login</h5>
            </div>
        </form>
    );
}