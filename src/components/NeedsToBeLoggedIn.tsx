// Tells the user to log in if user has no valid auth token.
// If logged in, shows content.
'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';



// The component will allow someone to see the content at first, no matter what.
// "NotLoggedIn" will display only after checking logged in status.
export default function NeedsToBeLoggedIn({ content }: { content: React.ReactNode }) {
    const [loggedIn, setLoggedIn] = useState<boolean>(true);

    const fetchCookie = async () => {
        const res = await fetch(`/api`, { method: 'GET' });
        const resJson = await res.json();
        setLoggedIn(resJson.cStatus==200);
    }

    useEffect(() => {
        fetchCookie();
    }, []);

    if (!loggedIn) return <NotLoggedIn />;
    return <>{content}</>;
}



function NotLoggedIn() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h2 style={{fontWeight: 500}}>You are not logged in.</h2>
            <h4>Please <Link href='/login'>log in</Link> or <Link href='/signup'>sign up</Link> to continue.</h4>
        </div>
    );
}