import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import { Alert, AlertType } from '@components/Alert';

import formStyles from '@styles/ui/form.module.css';
import { CheckIfLoading } from '@components/Loading';
import CenterLayout from '@components/containers/CenterLayout';



export default function Promo() {
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const attemptRedeem = async (formData: FormData) => {
        setLoading(true);
        const res = await fetch('/promo/api/', {
            method: 'POST',
            body: JSON.stringify({promoCode: formData.get('code')}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
        setLoading(false);
    }

    return (
        <CenterLayout>
            <CheckIfLoading loading={loading} content={<PromoForm alert={alert} attemptRedeem={attemptRedeem} />} />
        </CenterLayout>
    )
}

function PromoForm({ alert, attemptRedeem }: { alert: AlertType | null, attemptRedeem: (data: FormData)=>void }) {
    const inputs: FormInputType[] = [
        {title: 'Promo Code', type: 'text', name: 'code'}
    ];
    
    return (
        <div className={formStyles.container}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h2 className={formStyles.title}>Redeem a promo code</h2>
                <h4>Get a few free months.</h4>
            </div>
            <Form action={attemptRedeem} inputs={inputs} submitTitle='Redeem Code' />
            {alert && <Alert alert={alert} variations={[]} />}
        </div>
    );
}