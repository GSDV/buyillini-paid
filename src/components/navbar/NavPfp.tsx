'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useAuthContext } from '@components/providers/Auth';

import LoadingIcons from 'react-loading-icons'

import { getPfpUrl } from '@util/global';

import { colorScheme } from '@styles/colors';
import navbarStyles from '@styles/ui/navbar.module.css';



export default function NavProfile() {
    const authContext = useAuthContext();

    const [netId, setNetId] = useState<string>('');
    const [pfp, setPfp] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);


    const fetchInfo = async () => {
        setLoading(true);
        const res = await fetch(`/api`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.user != null) {
            const pfpUrl = getPfpUrl(resJson.user.profilePicture);
            setNetId(resJson.user.netId);
            setPfp(pfpUrl);
        }
        setLoading(false);
    }

    useEffect(() => {
        console.log("Fetching Navbar info");
        fetchInfo();
    }, [authContext.authToken]);



    if (loading) return <LoadingIcons.TailSpin style={{ marginLeft: 'auto' }} stroke={colorScheme.white} />;

    if (netId=='') return <RightNavbarItem title='Log In' link='/login' />;

    return (
        <Link href={`/account/${netId}`} style={{marginLeft: 'auto'}}>
            <img className={navbarStyles.profilePicture} alt='Profile Picture' src={pfp} width='30' height='30'  />
        </Link>
    );
}



function RightNavbarItem({ title, link }: { title: string, link: string }) {
    return (
        <Link href={link} className={navbarStyles.navbarItem} style={{marginLeft: 'auto', padding: '10px'}}>
            <h3>{title}</h3>
        </Link>
    );
}