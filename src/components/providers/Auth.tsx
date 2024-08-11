'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import Cookies from 'js-cookie';


interface AuthContextType {
    authToken: string,
    setAuthToken: React.Dispatch<React.SetStateAction<string>>,
    loading: boolean,
    fetchCookie: () => void
}

const init: AuthContextType = {
    authToken: '',
    setAuthToken: ()=>{},
    loading: true,
    fetchCookie: ()=>{}
};

const AuthContext = createContext<AuthContextType>(init);



// export function Auth({ cookie, children }: { cookie: RequestCookie | undefined, children: React.ReactNode }) {
export function Auth({ children }: { children: React.ReactNode }) {
    const [authToken, setAuthToken] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const fetchCookie = () => {
        const cookie = Cookies.get('authtoken');
        const token = (!cookie) ? '' : cookie;
        setLoading(false);
        console.log("FETCHED COOKIE: ", token);
        setAuthToken(token);
    }

    useEffect(() => {
        fetchCookie();
    }, []);

    return (
        <AuthContext.Provider value={{ authToken, setAuthToken, fetchCookie, loading }} >
            {children}
        </AuthContext.Provider>
    );
}



export function useAuthContext() {
    return useContext(AuthContext);
}