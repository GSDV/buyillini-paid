'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getRedactedUserFromAuth } from '@util/prisma/actions/user';

import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';



interface AuthContextType {
    authToken: string,
    setAuthToken: React.Dispatch<React.SetStateAction<string>>,
    loading: boolean
}

const init: AuthContextType = {
    authToken: '',
    setAuthToken: ()=>{},
    loading: true
};

const AuthContext = createContext<AuthContextType>(init);



export function Auth({ cookie, children }: { cookie: RequestCookie | undefined, children: React.ReactNode }) {
    const [authToken, setAuthToken] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const fetchCookie = async () => {
        console.log('------- STARTING fetchCookie -------');
        const token = (!cookie) ? '' : cookie.value;

        const userRes = await getRedactedUserFromAuth(token);
        if (!userRes) {
            setAuthToken('');
        }
        else {
            setAuthToken(token);
        }
        setLoading(false);
        console.log('------- ENDING fetchCookie -------');
        console.log('cookie/authotken: ', token, '   user: ', userRes?.email);
    }

    useEffect(() => {
        fetchCookie();
    }, []);

    return (
        <AuthContext.Provider value={{ authToken, setAuthToken, loading }} >
            {children}
        </AuthContext.Provider>
    );
}



export function useAuthContext() {
    return useContext(AuthContext);
}