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