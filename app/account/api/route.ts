import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { deleteAuthToken } from '@util/prisma/actions/tokens';
import { getMaxPagesFromUser, getPostsFromUser } from '@util/prisma/actions/posts';



export async function POST(req: NextRequest) {
    try {
        const { userId, page, deleted } = await req.json();
        if (userId==null || page==null || deleted==null) return NextResponse.json({ cStatus: 102, msg: `Some posts data missing. Refresh the page.` }, { status: 400 });

        const posts = await getPostsFromUser(userId, page, deleted);
        const maxPages = await getMaxPagesFromUser(userId, page, deleted);
        return NextResponse.json({ cStatus: 200, msg: `Success.`, posts: posts, maxPages: maxPages }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Service error: ${err}.` }, { status: 400 });
    }
}



// Logging out
export async function PUT(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        deleteAuthToken(authTokenCookie.value);
        cookies().set('authtoken', '');
        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Service error: ${err}.` }, { status: 400 });
    }
}