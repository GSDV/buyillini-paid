import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';



// Get redacted user prisma from auth token cookie
export async function GET(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 210, msg: `Success (not logged in).`, user: null }, { status: 200 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 210, msg: `Success (not logged in).`, user: null }, { status: 200 });

        return NextResponse.json({ cStatus: 200, msg: `Success.`, user: userPrisma }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}