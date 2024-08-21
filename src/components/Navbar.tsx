'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { BsList } from 'react-icons/bs';

import LoadingIcons from 'react-loading-icons'

import { useAuthContext } from '@components/providers/Auth';
import { useMenuShadowContext } from '@components/providers/MenuShadow';

import { BUYILLINI_LOGO, getPfpUrl } from '@util/global';

import navbarStyles from '@styles/ui/navbar.module.css';
import { useRouter } from 'next/navigation';



interface NavItem {
    title: string,
    link: string
}



export default function Navbar() {
    const items: NavItem[] = [
        { title: 'Shop', link: '/shop' },
        { title: 'Promos', link: '/promo' },
        { title: 'How It Works', link: '/how-it-works' }
    ];

    return (
        <div className={navbarStyles.navbar}>
            <Link href='/'>
                <img alt='logo' src={BUYILLINI_LOGO} width='50' height='50'  />
            </Link>

            {items.map((item, i) => <NavbarItem title={item.title} link={item.link} key={i} />)}

            {/* SPACER */}
            <div style={{ flexGrow: 1 }}></div> 

            <NavProfile />
            <HamburgerMenu items={items} />
        </div>
    );
}



function NavbarItem({ title, link }: NavItem) {
    return (
        <Link href={link} className={navbarStyles.navbarItem}>
            <h3>{title}</h3>
        </Link>
    );
}



function NavProfile() {
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
        fetchInfo();
    }, [authContext.authToken]);


    if (loading) return <LoadingIcons.TailSpin style={{ marginLeft: 'auto', color: 'var(--white)' }} />;

    // Not using NavbarItem so that "Log In" text does not disappear on small screens
    if (netId=='') return (
        <Link href='/login' className={navbarStyles.navbarItem} style={{ display: 'block' }}>
            <h3>Log In</h3>
        </Link>
    );

    return (
        <Link href={`/account/${netId}`}>
            <img className={navbarStyles.profilePicture} alt='Profile Picture' src={pfp} width='30' height='30' />
        </Link>
    );
}



function HamburgerMenu({ items }: { items: NavItem[] }) {
    const msContext = useMenuShadowContext();

    const openMenu = () => {
        msContext.setContent(<Popup items={items} />);
        msContext.openMenu();
    }

    return <BsList onClick={openMenu} className={navbarStyles.menuIcon} />;
}



function Popup({ items }: { items: NavItem[] }) {
    const msContext = useMenuShadowContext();

    return (
        <div className={navbarStyles.miniNavbar}>
            {items.map((item, i) => <MiniNavbarItem title={item.title} link={item.link} key={i} />)}

            {/* SPACERS */}
            <div></div>
            <div></div>

            <div onClick={msContext.closeMenu} className={navbarStyles.miniNavbarItem}>
                <h1>Close</h1>
            </div>
        </div>
    );
}



function MiniNavbarItem({ title, link }: NavItem) {
    const msContext = useMenuShadowContext();
    const router = useRouter();

    const navigateUser = () => {
        msContext.closeMenu();
        router.push(link);
    }

    return (
        <div onClick={navigateUser} className={navbarStyles.miniNavbarItem}>
            <h1>{title}</h1>
        </div>
    );
}