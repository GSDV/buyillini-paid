'use client';

import CenterLayout from '@components/containers/CenterLayout';

import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';

import Promo from '@components/pages/promo/Promo';



export default function Page() {
    return (
        <CenterLayout>
            <NeedsToBeLoggedIn content={<Promo />} />
        </CenterLayout>
    )
}