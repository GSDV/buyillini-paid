'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AlertType, CheckIfAlert } from '@components/Alert';
import { CheckIfLoading } from '@components/Loading';

import adminStyles from '@styles/pages/admin.module.css';



export interface AdminActionType {
    setAlert: React.Dispatch<React.SetStateAction<AlertType | null>>
}



export function CheckIfAdmin({ content }: { content: React.ReactNode }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const fetchPermissions = async () => {
        setLoading(true);
        const res = await fetch(`/admin/api`, { method: 'GET' });
        const resJson = await res.json();
        setAlert(resJson)
        setLoading(false);
    }

    useEffect(() => {
        fetchPermissions();
    }, []);

    return (
        <CheckIfLoading loading={loading} content={
            <CheckIfAlert alert={alert} content={content} />
        } />
    );
}



export function Subsection({ title, link }: { title: string, link: string }) {
    const router = useRouter();
    return <div onClick={()=>router.push(link)} className={adminStyles.subsection}>{title}</div>;
}



export function InputAction({ title, placeholder, action }: { title: string, placeholder: string, action: (v: string)=>void }) {
    const [val, setVal] = useState<string>('');
    const doAction = () => action(val);

    return (
        <div className={adminStyles.inputAction}>
            <input placeholder={placeholder} value={val} onChange={(e)=>setVal(e.target.value)} />
            <Button title={title} action={doAction} />
        </div>
    );
}



export function Button({ title, action }: { title: string, action: ()=>void }) {
    return <button onClick={action} className={adminStyles.button}>{title}</button>;
}