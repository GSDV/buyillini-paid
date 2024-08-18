// Tells the user to log in if user has no valid auth token.
// If logged in, shows content.
'use client';

import { useAuthContext } from '@components/providers/Auth';

import NotLoggedIn from '@components/NotLoggedIn';
import Loading from '@components/Loading';



// export default function NeedsToBeLoggedIn({ content }: { content: React.ReactNode }) {
//     const authContext = useAuthContext();

//     return (
//         <>
//             {authContext.loading ?
//                 <Loading />
//             :
//                 <>{authContext.authToken==='' ? 
//                     <NotLoggedIn />
//                 :
//                     <>{content}</>
//                 }</>
//             }
//         </>
//     )
// }

export default function NeedsToBeLoggedIn({ content }: { content: React.ReactNode }) {
    const authContext = useAuthContext();

    return (
        <>{authContext.authToken==='' ? 
            <NotLoggedIn />
        :
            <>{content}</>
        }</>
    );
}