'use client';

import CenterLayout from '@components/containers/CenterLayout';

import Reset from '@components/pages/password/Reset';



export default function Page({ params }: { params: { rpToken: string } }) {
    return (
        <CenterLayout>
            <Reset rpToken={params.rpToken} />
        </CenterLayout>
    );
}