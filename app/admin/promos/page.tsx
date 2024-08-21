'use client';

import { useState } from 'react';

import VerticalLayout from '@components/containers/VerticalLayout';
import { AdminActionType, CheckIfAdmin } from '@components/pages/admin/Admin';
import Form, { FormInputType } from '@components/Form';
import DisplayUser from '@components/pages/admin/DisplayUser';
import { Alert, AlertType } from '@components/Alert';

import { User } from '@prisma/client';

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
                {alert && <Alert alert={alert} variations={[]} />}
                <div className={adminStyles.actionsContainer}>
                <GetPromo setAlert={setAlert} />
                <MakePromo setAlert={setAlert} />
        </div>
        </div>
    );
}



function GetPromo({ setAlert }: AdminActionType) {
    const [user, setUser] = useState<User | null>(null);

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
        setUser(resJson.user);
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Get User Data</h3>
            <Form action={getUser} inputs={inputs} submitTitle='Get User' />
            {user && <div>
                <DisplayUser user={user} />
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
        console.log("A", formData.get('eligible'))
        console.log("B", formData.get('eligible')==='')
        console.log("C", typeof formData.get('eligible'))
        const eligibleUsers = (formData.get('eligible') as string).split(',');
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
            <h3>Add Free Months</h3>
            <Form action={attemptMakePromo} inputs={inputs} submitTitle='Make Promo' />
        </div>
    );
}












///






function DeleteUser({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' }
    ];

    const banUser = async (formData: FormData) => {
        const netId = formData.get('netId');
        const data = { netId };
        const operation = 'DELETE_USER';

        const res = await fetch(`/admin/users/api/`, {
            method: 'DELETE',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Delete User</h3>
            <Form action={banUser} inputs={inputs} submitTitle='Delete User' />
        </div>
    );
}



function MarkDeleteUser({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' }
    ];

    const banUser = async (formData: FormData) => {
        const netId = formData.get('netId');
        const data = { netId };
        const operation = 'MARK_DELETE_USER';

        const res = await fetch(`/admin/users/api/`, {
            method: 'DELETE',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Mark Delete User</h3>
            <Form action={banUser} inputs={inputs} submitTitle='Delete User' />
        </div>
    );
}



function BanUser({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' },
        { title: 'Ban Message', name: 'msg', type: 'text' },
        { title: 'Ban Expiration', name: 'expiration', type: 'datetime-local' }
    ];

    const banUser = async (formData: FormData) => {
        const netId = formData.get('netId');
        const msg = formData.get('msg');
        const expiration = (formData.get('expiration')=='') ? null : formData.get('expiration');

        const data = { netId, msg, expiration };
        const operation = 'BAN_USER';

        const res = await fetch(`/admin/users/api/`, {
            method: 'DELETE',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Ban User</h3>
            <Form action={banUser} inputs={inputs} submitTitle='Ban User' />
        </div>
    );
}



function UnbanUser({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' }
    ];

    const attemptUnbanUser = async (formData: FormData) => {
        const netId = formData.get('netId');

        const data = { netId };
        const operation = 'UNBAN_USER';

        const res = await fetch(`/admin/users/api/`, {
            method: 'PUT',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Unban User</h3>
            <Form action={attemptUnbanUser} inputs={inputs} submitTitle='Unban User' />
        </div>
    );
}
