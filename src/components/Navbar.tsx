'use client';

import { useEffect, useState } from 'react';

import { DEFAULT_PFP } from '@util/global';

import { useAuthContext } from '@components/providers/Auth';

import { navbarInfo } from '@util/prisma/actions/user';

import Link from 'next/link';

import navbarStyles from '@styles/ui/navbar.module.css'



export default function Navbar() {
    return (
        <div className={navbarStyles.navbar}>
            <a href='/'><img alt='logop' src='https://buyillini.s3.us-east-2.amazonaws.com/bi-logo' width='50'  /> </a>
            <NavbarItem title='Shop' link='/shop/' />
            <NavbarItem title='Promos' link='/promo/' />
            <NavbarItem title='How It Works' link='/how-it-works/' />
            <NavProfile />
        </div>
    );
}



function NavbarItem({ title, link }: { title: string, link: string }) {
    return (
        <Link href={link} className={navbarStyles.navbarItem}>
            <h3>{title}</h3>
        </Link>
    );
}



function NavProfile() {
    const authContext = useAuthContext();

    const [pfpUrl, setPfp] = useState<string>(DEFAULT_PFP);
    const [netId, setNetId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPfp = async () => {
        setLoading(true);
        const { pfp, netId } = await navbarInfo(authContext.authToken);
        setPfp(pfp);
        setNetId(netId);
        setLoading(false);
    }

    useEffect(() => {
        console.log("NAVBAR PROFILE LOADING")
        fetchPfp();
    }, [authContext.authToken]);

    return (
        <>
            {!loading &&
            <>
                {pfpUrl=='' ?
                    <RightNavbarItem title='Log In' link='/login' />
                :
                    <Link href={`/account/${netId}`} style={{marginLeft: 'auto'}}>
                        <img className={navbarStyles.profilePicture} alt='Profile Picture' src={pfpUrl} width={30} height={30} />
                    </Link>
                }
            </>
            }
        </>
    );
}


function RightNavbarItem({ title, link }: { title: string, link: string }) {
    return (
        <Link href={link} className={navbarStyles.navbarItem} style={{marginLeft: 'auto', padding: '10px'}}>
            <h3>{title}</h3>
        </Link>
    );
}
