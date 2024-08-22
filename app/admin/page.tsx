'use client'

import CenterLayout from '@components/containers/CenterLayout';
import { CheckIfAdmin, Subsection } from '@components/pages/admin/Admin';

import adminStyles from '@styles/pages/admin.module.css';



export default function Page() {

    return (
        <CenterLayout>
            <CheckIfAdmin content={<Dashboard />} />
        </CenterLayout>
    );
}



function Dashboard() {
    return (
        <div className={adminStyles.dashboard}>
            <h1>Admin Dashboard</h1>
            <div className={adminStyles.actionsContainer}>
                <Subsection title='Users' link='/admin/users/' />
                <Subsection title='Posts' link='/admin/posts/' />
                <Subsection title='Promo' link='/admin/promos/' />
            </div>
        </div>
    );
}