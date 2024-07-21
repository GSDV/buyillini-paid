'use client';

import { createContext, useContext, useEffect, useState } from 'react';




interface ReloaderContextType {
    reload: ()=>void
}

const ReloaderContext = createContext<ReloaderContextType>({reload: ()=>{}});



export function Reloader({ children }: { children: React.ReactNode }) {
    const reload = () => { window.location.reload(); }
    return (
        <ReloaderContext.Provider value={{ reload }} >
            {children}
        </ReloaderContext.Provider>
    );
}



export function useReloaderContext() {
    return useContext(ReloaderContext);
}