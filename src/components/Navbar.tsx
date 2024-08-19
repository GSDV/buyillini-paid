'use server'

import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { DEFAULT_PFP } from '@util/global';
import { navbarInfo } from '@util/prisma/actions/user';
import navbarStyles from '@styles/ui/navbar.module.css';

export default async function Navbar() {
    return (
        <div className={navbarStyles.navbar}>
            <Link href='/'>
                {/* <Image alt='logop' src='https://buyillini.s3.us-east-2.amazonaws.com/bi-logo' width={50} height={50} /> */}
                <img alt='logo' src='https://buyillini.s3.us-east-2.amazonaws.com/bi-logo' width='50' height='50'  />
            </Link>
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



async function NavProfile() {
    const cookieStore = cookies();
    const authToken = cookieStore.get('authtoken')?.value || '';

    let pfpUrl = '';
    let netId = '';

    if (authToken!='') {
        const resNav = await navbarInfo(authToken);
        pfpUrl = resNav.pfp;
        netId = resNav.netId;
    }

    return (
        <>
            {pfpUrl == '' ? 
                <RightNavbarItem title='Log In' link='/login' />
            :
                <Link href={`/account/${netId}`} style={{marginLeft: 'auto'}}>
                    {/* <Image className={navbarStyles.profilePicture} alt='Profile Picture' src={pfpUrl} width={30} height={30} /> */}
                    <img className={navbarStyles.profilePicture} alt='Profile Picture' src={pfpUrl} width='30' height='30'  />
                </Link>
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