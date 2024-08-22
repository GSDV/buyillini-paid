'use client';

import VerticalLayout from '@components/containers/VerticalLayout';
import { AdminActionType, CheckIfAdmin } from '@components/pages/admin/Admin';
import CreateSuperPost from '@components/pages/post/SuperPost';
import { useState } from 'react';



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
