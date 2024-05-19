import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import formStyles from '@styles/ui/form.module.css';

import { Alert, AlertType } from '@components/Alert';



export default function Promo() {
    const inputs: FormInputType[] = [
        {title: 'Promo Code', type: 'text', name: 'code'}
    ];

    const [alert, setAlert] = useState<AlertType | null>(null);


    const attemptRedeem = async (formData: FormData) => {
        const res = await fetch('promo/api/', {
            method: 'POST',
            body: JSON.stringify({promoCode: formData.get('code')}),
            headers: { 'Content-Type': 'application/json' }
        });

        const resJSON = await res.json();
        setAlert(resJSON);
    }

    return (
        <>
            <div className={formStyles.container}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <h2 className={formStyles.title}>Redeem a promo code</h2>
                    <h4>Get a few free months.</h4>
                </div>
                <Form action={attemptRedeem} inputs={inputs} submitTitle='Redeem Code' />
                {alert && <Alert alert={alert} variations={[]} />}
            </div>
        </>
    );
}
