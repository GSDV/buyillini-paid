import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { getDraftedPost } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';



export async function GET(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `User is not logged in.` }, { status: 400 });
        const user = await getRedactedUserFromAuth(authTokenCookie.value);
        const resValidUser = isValidUser(user);
        if (!user) return NextResponse.json({ cStatus: 402, msg: `User does not exist.` }, { status: 400 }); // For typescript
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const draftedPostPrisma = await getDraftedPost(user.id);
        if (!draftedPostPrisma) return NextResponse.json({ cStatus: 201, msg: `B Success.`, freeMonths: user.freeMonths, draftedPost: null }, { status: 200 });

        return NextResponse.json({ cStatus: 200, msg: `Success.`, freeMonths: user.freeMonths, draftedPost: draftedPostPrisma }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}