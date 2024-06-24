

// in api of account/, add logout functionality.
'use client';

import { useEffect, useState } from 'react';


import { useAuthContext } from '@components/providers/Auth';


import CenterLayout from '@components/containers/CenterLayout';
import NeedsToBeLoggedIn from '@components/NeedsToBeLoggedIn';

// import { getAccountData } from '@util/ui/account';
import { User } from '@prisma/client';



// note, nothing should be here. There should be no page.tsx in account/, only in account/[netid]

export default function Page() {
    return (
        <CenterLayout>
            <NeedsToBeLoggedIn content={<Account />} />
        </CenterLayout>
    );
}



function Account() {
    const authContext = useAuthContext();
    const [accountData, setAccountData] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    const fetchAccountData = async () => {
        // const accountDataPrisma = await getAccountData(authContext.authToken);
    
        // console.log(accountDataPrisma);
        // setAccountData(accountDataPrisma);
        setLoading(false);
    }

    useEffect(() => {
        fetchAccountData();
    }, []);

    return (
        <div>
            {loading ?
                <h1>Loading...</h1>
            :
                <>
                    {!accountData ?
                        <h1>Not logged in</h1>
                    :
                        <h1>{accountData.displayName}</h1>
                    }
                </>
            }
        </div>
    );
}