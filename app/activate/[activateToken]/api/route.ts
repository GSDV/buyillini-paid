import { NextRequest, NextResponse } from 'next/server';

import { activateAccount } from '@util/prisma/actions/user';
import { getActivateToken } from '@util/prisma/actions/tokens';

import { isActivationTokenExpired } from '@util/api/tokens';



export async function POST(req: NextRequest, { params }: { params: { activateToken: string } }) {
    try {
        const activateToken = params.activateToken;
        if (!activateToken) return NextResponse.json({ cStatus: 101, msg: `No token provided. Please click the link in your email.` }, { status: 400 });

        const tokenPrisma = await getActivateToken(activateToken);
        if (!tokenPrisma) return NextResponse.json({ cStatus: 501, msg: `You did not provide a real activation token.` }, { status: 400 });

        const netId = tokenPrisma.user.netId;
        if (tokenPrisma.user.active) return NextResponse.json({ cStatus: 201, msg: `This account is already active.`, netId: netId }, { status: 200 });

        if (isActivationTokenExpired(tokenPrisma)) return NextResponse.json({ cStatus: 502, msg: `Activation token expired.` }, { status: 400 });

        await activateAccount(tokenPrisma.user.id);

        return NextResponse.json({ cStatus: 200, msg: `Success, you'll be redirected shortly.`, netId: netId }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Error activating account ${err}` }, { status: 400 });
    }
}