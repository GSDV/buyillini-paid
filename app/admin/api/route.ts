import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { isAdmin } from '@util/prisma/actions/admin';



// Check if admin account
export async function GET(req: NextRequest, { params }: { params: { netId: string } }) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}