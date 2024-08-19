// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';

// import Cookies from 'js-cookie';
// import { DEFAULT_PFP } from '@util/global';


// interface AuthContextType {
//     authToken: string,
//     setAuthToken: React.Dispatch<React.SetStateAction<string>>,
//     fetchCookie: () => void
// }

// const init: AuthContextType = {
//     authToken: '',
//     setAuthToken: ()=>{},
//     fetchCookie: ()=>{}
// };

// const AuthContext = createContext<AuthContextType>(init);



// export function Auth({ children }: { children: React.ReactNode }) {
//     const [authToken, setAuthToken] = useState<string>('');
//     const [pfp, setPfp] = useState<string>('');

//     const fetchCookies = () => {
//         const authCookie = Cookies.get('authtoken');
//         const authToken = (!authCookie) ? '' : authCookie;
//         setAuthToken(authToken);

//         const pfpCookie = Cookies.get('pfp');
//         const pfpValue = (!pfpCookie) ? '' : pfpCookie;
//         setPfp(pfpValue);
//     }

//     useEffect(() => {
//         console.log("USE EFFECT COOKIE");
//         fetchCookies();
//     }, []);

//     return (
//         <AuthContext.Provider value={{ authToken, setAuthToken, fetchCookie }} >
//             {children}
//         </AuthContext.Provider>
//     );
// }



// export function useAuthContext() {
//     return useContext(AuthContext);
// }


'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import Cookies from 'js-cookie';


interface AuthContextType {
    authToken: string,
    setAuthToken: React.Dispatch<React.SetStateAction<string>>,
    fetchCookie: () => void
}

const init: AuthContextType = {
    authToken: '',
    setAuthToken: ()=>{},
    fetchCookie: ()=>{}
};

const AuthContext = createContext<AuthContextType>(init);



export function Auth({ children }: { children: React.ReactNode }) {
    const [authToken, setAuthToken] = useState<string>('');

    const fetchCookie = () => {
        const cookie = Cookies.get('authtoken');
        const token = (!cookie) ? '' : cookie;
        setAuthToken(token);
    }

    useEffect(() => {
        fetchCookie();
    }, []);

    return (
        <AuthContext.Provider value={{ authToken, setAuthToken, fetchCookie }} >
            {children}
        </AuthContext.Provider>
    );
}



export function useAuthContext() {
    return useContext(AuthContext);
}