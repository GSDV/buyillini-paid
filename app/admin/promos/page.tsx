'use client';

import { useState } from 'react';

import VerticalLayout from '@components/containers/VerticalLayout';
import { AdminActionType, CheckIfAdmin } from '@components/pages/admin/Admin';
import Form, { FormInputType } from '@components/Form';
import { Alert, AlertType } from '@components/Alert';

import { PromoCode } from '@prisma/client';

import adminStyles from '@styles/pages/admin.module.css';



export default function Page() {
    return (
        <VerticalLayout>
            <CheckIfAdmin content={<Actions />} />
        </VerticalLayout>
    );
}



function Actions() {
    const [alert, setAlert] = useState<AlertType | null>(null);

    return (
        <div className={adminStyles.dashboard}>
            <h1>User Actions</h1>
                {alert && <Alert alert={alert}  />}
                <div className={adminStyles.actionsContainer}>
                    <GetPromo setAlert={setAlert} />
                    <MakePromo setAlert={setAlert} />
                    <DeletePromo setAlert={setAlert} />
            </div>
        </div>
    );
}



function GetPromo({ setAlert }: AdminActionType) {
    const [promo, setPromo] = useState<PromoCode | null>(null);

    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' }
    ];

    const getUser = async (formData: FormData) => {
        const netId = formData.get('netId');

        const data = { netId };
        const encodedData = encodeURIComponent(JSON.stringify(data));
        const operation = 'GET_USER';

        const res = await fetch(`/admin/promos/api?operation=${operation}&data=${encodedData}`, {
            method: 'GET'
        });
        const resJson = await res.json();
        setPromo(resJson.data.promo);
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Get Promo Code</h3>
            <Form action={getUser} inputs={inputs} submitTitle='Get User' />
            {promo && <div>
                <h3>{promo.code}</h3>
            </div>}
        </div>
    );
}



function MakePromo({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'Promo Code', name: 'code', type: 'text' },
        { title: 'Eligible Users (CSV)', name: 'eligible', type: 'text' },
        { title: 'Free Months', name: 'freeMonths', type: 'number' }
    ];

    const attemptMakePromo = async (formData: FormData) => {
        const promoCode = formData.get('code');
        const eligibleUsers = formData.get('eligible')=='' ? [] : (formData.get('eligible') as string).split(',');
        const freeMonths = Number(formData.get('freeMonths'));

        const data = { promoCode, eligibleUsers, freeMonths };
        const operation = 'MAKE_PROMO';

        const res = await fetch(`/admin/promos/api/`, {
            method: 'POST',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Make Promo Code</h3>
            <Form action={attemptMakePromo} inputs={inputs} submitTitle='Make Promo' />
        </div>
    );
}



function DeletePromo({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'Promo', name: 'code', type: 'text' }
    ];

    const attemptDeletePromo = async (formData: FormData) => {
        const promoCode = formData.get('code');
        const data = { promoCode };
        const operation = 'DELETE_PROMO';

        const res = await fetch(`/admin/promos/api/`, {
            method: 'DELETE',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Delete Promo</h3>
            <Form action={attemptDeletePromo} inputs={inputs} submitTitle='Delete Promo' />
        </div>
    );
}


