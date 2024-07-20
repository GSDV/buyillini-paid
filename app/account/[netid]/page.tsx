'use client';

import { useEffect, useState } from 'react';

import { RedactedUserWithPosts } from '@util/prisma/types';

import Loading from '@components/Loading';

import CenterLayout from '@components/containers/CenterLayout';
import { Alert, AlertType } from '@components/Alert';
import Account from '@components/pages/account/Account';





export default function Page({ params }: { params: { netId: string } }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<RedactedUserWithPosts | null>(null);
    const [ownAccount, setOwnAccount] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const fetchUserData = async () => {
        console.log(`account/${params.netId}/api/`)
        const res = await fetch(`/account/${params.netId}/api/`, { method: 'GET' });
        const resJson = await res.json();
        console.log(resJson)

        if (resJson.cStatus==200 || resJson.cStatus==202) {
            setUser(resJson.userData);
            setOwnAccount(resJson.cStatus==202);
        } else {
            setAlert(resJson);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <CenterLayout>
            {loading ? 
                <Loading />
            :
                <>{alert ?
                    <Alert alert={alert} variations={[]} />
                :
                    <>{user!=null && <Account user={user} ownAccount={ownAccount} /> }</>
                }</>
            }
        </CenterLayout>
    );
}







///////////////////////////////////

// export default function Page({ params }: { params: { netId: string } }) {
//     const [isOwnAccount, setOwnAccount] = useState<boolean>(false);
//     const [loading, setLoading] = useState<boolean>(true);

//     const checkIfOwnAccount = async () => {
//         const res = await fetch('account/', { method: 'GET' });
//         const resJson = await res.json();
//         if (resJson.cStatus==202) setOwnAccount(params.netId == resJson.netId);
//         setLoading(false);
//     }

//     useEffect(() => {
//         checkIfOwnAccount();
//     }, []);

//     return (
//         <VStack>
//             {loading ? 
//                 <Loading />
//             :
//                 <ChooseScreen isOwnAccount={isOwnAccount} />
//             }
//         </VStack>
//     );
// }



// function ChooseScreen({ isOwnAccount }: { isOwnAccount: boolean }) {
//     return (
//         <>
//             {(isOwnAccount) ?
//                 <OwnAccount />
//             :
//                 <OtherAccount />
//             }
//         </>
//     );
// }


// {/* <div style={{padding: '20px'}}>
//                             <Alert alert={{cStatus: 404, msg: 'User not found.'}} variations={[]} />
//                         </div> */}