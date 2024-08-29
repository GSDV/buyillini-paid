import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { isAdmin, createSuperPost, isValidInputSuperPostData, superPostDataFromInputs } from '@util/prisma/actions/admin';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';



export async function POST(req: NextRequest) {
    try {
        console.log("AAA");
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        console.log("BBB");
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        console.log("CCC");
        // For TypeScript:
        const adminPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!adminPrisma)return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        console.log("DDD");
        const { inputData } = await req.json();
        if (!inputData) return NextResponse.json({ cStatus: 101, msg: `No inputData provided.` }, { status: 400 });

        console.log("EEE", inputData);
        // This is a synchronous operation, but deployment with Vercel somehow makes it return a promise.
        // Hence the unnecessary "await"
        const resValidPost = isValidInputSuperPostData(inputData);
        console.log("FFF resValidPost:", resValidPost)
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });

        // Also a synchronous process, same problem as above.
        const postData = superPostDataFromInputs(inputData);
        console.log("GGG postData:", postData);

        const postId = await createSuperPost(postData, adminPrisma.id);
        console.log("HHH postId:", postId)
        
        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}