// When a menu needs to be opened, the rest of the screen needs a black layer as a background.
'use client';

import { createContext, useContext, useEffect, useState } from 'react';


interface MenuShadowContextType {
    setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>,
    open: boolean,
    openMenu: () => void,
    closeMenu: () => void
}

const init: MenuShadowContextType = {
    setContent: ()=>{},
    open: false,
    openMenu: () => {},
    closeMenu: () => {}
};

const MenuShadowContext = createContext<MenuShadowContextType>(init);



export function MenuShadow({ children }: { children: React.ReactNode }) {
    const [content, setContent] = useState<React.ReactNode>(<></>);
    const [open, setOpen] = useState<boolean>(false);

    const openMenu = () => { setOpen(true) }
    const closeMenu = () => { setOpen(false) }

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <MenuShadowContext.Provider value={{ setContent, open, openMenu, closeMenu }} >
            {children}
            {open && <Menu content={content} setOpen={setOpen} />}
        </MenuShadowContext.Provider>
    );
}



export function useMenuShadowContext() {
    return useContext(MenuShadowContext);
}



function Menu({ content, setOpen }: { content: React.ReactNode, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) setOpen(false);
    }

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', opacity: 0.5 }} onClick={handleOverlayClick}></div>
            <div style={{ position: 'fixed', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={handleOverlayClick}>
                {content}
            </div>
        </>
    );
}