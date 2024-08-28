'use client';

import VerticalLayout from '@components/containers/VerticalLayout';
import CreateSuperPost from '@components/pages/post/SuperPost';



// Do not fetch a drafted post. All super posts will be created and activated immediately.
export default function Page() {
    return (
        <VerticalLayout>
            <CreateSuperPost />
        </VerticalLayout>
    )
}