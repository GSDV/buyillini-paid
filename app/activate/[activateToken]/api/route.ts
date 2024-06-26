import { NextRequest, NextResponse } from 'next/server';

import { netIdFromEmail } from '@util/global';
import { activateAccount, getActivateToken } from '@util/prisma/actions';
import { isTokenExpired } from '@util/api/verification';



export async function POST(req: NextRequest) {
    const { activateToken } = await req.json();
    if (!activateToken) return NextResponse.json({ cStatus: 101, msg: `No token provided. Please click the link in your email.` }, { status: 400 });

    const tokenPrisma = await getActivateToken(activateToken);
    if (!tokenPrisma) return NextResponse.json({ cStatus: 501, msg: `You did not provide a real activation token.` }, { status: 400 });
    
    const netId = netIdFromEmail(tokenPrisma.user.email);
    if (tokenPrisma.user.active) return NextResponse.json({ cStatus: 201, msg: `This account is already active.`, netId: netId }, { status: 200 });

    if (isTokenExpired(tokenPrisma)) return NextResponse.json({ cStatus: 502, msg: `Activation token expired.` }, { status: 400 });

    try {
        await activateAccount(tokenPrisma.user.id);
    } catch (err) { return NextResponse.json({ cStatus: 905, msg: `Error activating account ${err}` }, { status: 400 }); }
    return NextResponse.json({ cStatus: 200, msg: `Success, you'll be redirected shortly.`, netId: netId }, { status: 200 });
}