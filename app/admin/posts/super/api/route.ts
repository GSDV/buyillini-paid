import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { isAdmin, createSuperPost, isValidInputSuperPostData, superPostDataFromInputs } from '@util/prisma/actions/admin';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';



export async function POST(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');

        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        // For TypeScript:
        const adminPrisma = await getRedactedUserFromAuth((authTokenCookie as any).value);
        if (!adminPrisma)return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const { inputData } = await req.json();
        if (!inputData) return NextResponse.json({ cStatus: 101, msg: `No inputData provided.` }, { status: 400 });

        // This is a synchronous operation, but deployment with Vercel somehow makes it return a promise.
        // Hence the unnecessary "await"
        const resValidPost = await isValidInputSuperPostData(inputData);
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });

        // Also a synchronous process, same problem as above.
        const postData = await superPostDataFromInputs(inputData);

        const postId = await createSuperPost(postData, adminPrisma.id);
        
        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}