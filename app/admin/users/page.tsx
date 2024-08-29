'use client';

import { useState } from 'react';

import VerticalLayout from '@components/containers/VerticalLayout';
import { AdminActionType, CheckIfAdmin, InputAction } from '@components/pages/admin/Admin';
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
            {alert && <Alert alert={alert}  />}
            <div className={adminStyles.actionsContainer}>
                <GetAndUpdateUser setAlert={setAlert} />
                <DeleteUser setAlert={setAlert} />
                <MarkDeleteUser setAlert={setAlert} />
                <BanUser setAlert={setAlert} />
                <UnbanUser setAlert={setAlert} />
                <AddFreeMonths setAlert={setAlert} />
            </div>
        </div>
    );
}



function GetAndUpdateUser({ setAlert }: AdminActionType) {
    const [user, setUser] = useState<User | null>(null);

    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' }
    ];

    const getUser = async (formData: FormData) => {
        const netId = formData.get('netId');

        const data = { netId };
        const encodedData = encodeURIComponent(JSON.stringify(data));
        const operation = 'GET_USER';

        const res = await fetch(`/admin/users/api?operation=${operation}&data=${encodedData}`, {
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




function DeleteUser({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' }
    ];

    const deleteUser = async (formData: FormData) => {
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
            <Form action={deleteUser} inputs={inputs} submitTitle='Delete User' />
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



function AddFreeMonths({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'NetId', name: 'netId', type: 'text' },
        { title: 'Free Months To Add', name: 'freeMonths', type: 'number' }
    ];

    const attemptAdd = async (formData: FormData) => {
        const netId = formData.get('netId');
        const freeMonths = Number(formData.get('freeMonths'));

        const data = { netId, freeMonths };
        const operation = 'ADD_FREE_MONTHS';

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
            <h3>Add Free Months</h3>
            <Form action={attemptAdd} inputs={inputs} submitTitle='Add' />
        </div>
    );
}