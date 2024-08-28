'use client'

import { useEffect, useState } from 'react';

import Link from 'next/link';

import VerticalLayout from '@components/containers/VerticalLayout';
import CreateSuperPost from '@components/pages/post/SuperPost';
import { Alert, AlertType } from '@components/Alert';
import { Post } from '@prisma/client';
import Loading, { CheckIfLoading } from '@components/Loading';


// Do not fetch a drafted post. All super posts will be activated immediately.
export default function Page() {
    return (
        <VerticalLayout>
            <CreateSuperPost />
        </VerticalLayout>
    )
}