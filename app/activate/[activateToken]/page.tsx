'use client';

import CenterLayout from '@components/containers/CenterLayout';

import VerifyAccount from '@components/pages/activate/VerifyAccount';



export default function Page({ params }: { params: { activateToken: string } }) {
    return (
        <CenterLayout>
            <VerifyAccount activateToken={params.activateToken} />
        </CenterLayout>
    );
}