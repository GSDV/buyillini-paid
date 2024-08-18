'use client'

import CenterLayout from '@components/containers/CenterLayout';
import { CheckIfAdmin, Subsection } from '@components/pages/admin/Admin';



export default function Page() {

    return (
        <CenterLayout>
            <CheckIfAdmin content={<Dashboard />} />
        </CenterLayout>
    );
}



function Dashboard() {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <Subsection title='Users' link='/admin/users/' />
        </div>
    );
}