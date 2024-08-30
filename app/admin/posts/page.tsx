'use client';

import { Alert, AlertType } from '@components/Alert';
import VerticalLayout from '@components/containers/VerticalLayout';
import { AdminActionType, CheckIfAdmin } from '@components/pages/admin/Admin';
import { useState } from 'react';

import adminStyles from '@styles/pages/admin.module.css';
import Form, { FormInputType } from '@components/Form';



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
            <h1>Post Actions</h1>
            {alert && <Alert alert={alert}  />}
            <div className={adminStyles.actionsContainer}>
                <DeletePost setAlert={setAlert} />
                <MarkDeletePost setAlert={setAlert} />
            </div>
        </div>
    );
}



function DeletePost({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'Post ID', name: 'postId', type: 'text' }
    ];

    const deletePost = async (formData: FormData) => {
        const postId = formData.get('postId');
    
        const data = { postId };
        const operation = 'DELETE_POST';

        const res = await fetch(`/admin/posts/api/`, {
            method: 'DELETE',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Delete Post</h3>
            <Form action={deletePost} inputs={inputs} submitTitle='Delete Post' />
        </div>
    );
}



function MarkDeletePost({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'Post ID', name: 'postId', type: 'text' }
    ];

    const markDeletePost = async (formData: FormData) => {
        const postId = formData.get('postId');
        const data = { postId };
        const operation = 'MARK_DELETE_POST';

        const res = await fetch(`/admin/posts/api/`, {
            method: 'DELETE',
            body: JSON.stringify({ operation, data }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Mark Delete Post</h3>
            <Form action={markDeletePost} inputs={inputs} submitTitle='Mark Delete Post' />
        </div>
    );
}
