import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getUser, getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { createAuthToken } from '@util/prisma/actions/tokens';

import { isValidUser } from '@util/api/auth';
import { isValidEmail, hashPassword } from '@util/api/user';
import { revalidatePath } from 'next/cache';



// When loading the login page, we will first see if the user is already logged in
export async function GET(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 200, msg: `User is not logged in.` }, { status: 200 });
        const user = await getRedactedUserFromAuth(authTokenCookie.value);
        const resValidUser = isValidUser(user);

        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 200 });

        return NextResponse.json({ cStatus: 201, msg: `User is already logged in.`, netId: (user as any).netId }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// User is trying to log in
// Their account will be created AND a verification email will be automatically sent
export async function POST(req: NextRequest) {
    try {
        const { userData } = await req.json();
        if (!userData) return NextResponse.json({ cStatus: 101, msg: `No itemData provided. Refresh this page.` }, { status: 400 });
        if (!userData.email || !userData.password || userData.password==='') return NextResponse.json({ cStatus: 101, msg: `Some data fields are missing.` }, { status: 400 });
        if (!isValidEmail(userData.email)) return NextResponse.json({ cStatus: 102, msg: `Use your Illinois email.` }, { status: 400 });

        const userPrisma = await getUser({email: userData.email});
        const validRes = isValidUser(userPrisma);
        if (!validRes.valid || !userPrisma) return NextResponse.json(validRes.nextres, { status: 400 });

        const hashedPassword = await hashPassword(userData.password, userPrisma.salt);
        if (hashedPassword !== userPrisma.password) return NextResponse.json({ cStatus: 403, msg: `Incorrect password.` }, { status: 400 });

        const token = await createAuthToken(userPrisma.id);
        cookies().set('authtoken', token);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, netId: userPrisma.netId }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}