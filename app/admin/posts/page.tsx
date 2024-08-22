'use client';

import VerticalLayout from '@components/containers/VerticalLayout';
import { CheckIfAdmin } from '@components/pages/admin/Admin';



export default function Page() {
    return (
        <VerticalLayout>
            <CheckIfAdmin content={<Nothing />} />
        </VerticalLayout>
    );
}



function Nothing() {
    return (
        <h1>Nothing for now</h1>
    )
}
