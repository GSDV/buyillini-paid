'use client';

import { useEffect, useState } from 'react';

import { useAuthContext } from '@components/providers/Auth';

import VStack from '@components/containers/VStack';
import Loading from '@components/Loading';
import { Alert } from '@components/Alert';

import { OwnAccount } from '@components/pages/account/Own';
import { OtherAccount } from '@components/pages/account/Other';

import { getUserFromNetId } from '@util/prisma/actions/user';
import { isValidUser } from '@util/api/auth';

import { UserWithItems } from '@util/prisma/types';



export default function Page({ params }: { params: { netId: string } }) {
    const [accountData, setAccountData] = useState<UserWithItems | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchAccount = async () => {
        const userData = await getUserFromNetId(params.netId);
        if (isValidUser(userData)) setAccountData(userData);
        setLoading(false);
    }

    useEffect(() => {
        fetchAccount();
    }, []);

    return (
        <VStack>
            {loading ? 
                <Loading />
            :
                <>
                    {!accountData ?
                        <div style={{padding: '20px'}}>
                            <Alert alert={{cStatus: 404, msg: 'User not found.'}} variations={[]} />
                        </div>
                    : 
                        <ChooseScreen user={accountData} />
                    }
                </>
            }
        </VStack>
    );
}



/*
Now that user has been fetched (and is a real, non-banned, non-deleted user), make a decision:
    1. If client is not logged in: display OTHER
    2. If client is in but is not user: display OTHER
    3. If client is logged in and is user: display OWN
*/
function ChooseScreen({ user }: { user: UserWithItems }) {
    const authContext = useAuthContext();
    return (
        <>
            {(!authContext.user || authContext.user.id!=user.id) ?
                <OtherAccount user={user} posts={user.posts} />
            :
                <OwnAccount user={user} posts={user.posts} />
            }
        </>
    );
}