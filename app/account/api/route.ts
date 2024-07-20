import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';

import { isValidUser } from '@util/api/auth';



// When loading the account page, we will first check if the user is seeing his own account
export async function GET(req: NextRequest) {
    try {
        console.log("AAAB")
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 200, msg: `User is not logged in.` }, { status: 200 });
        const user = await getRedactedUserFromAuth(authTokenCookie.value);
        const resValidUser = isValidUser(user);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 200 });
        return NextResponse.json({ cStatus: 202, msg: `User is logged in.`, netId: (user as any).netId }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}.` }, { status: 400 });
    }
}