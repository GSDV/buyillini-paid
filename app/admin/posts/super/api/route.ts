import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { isAdmin, createSuperPost, isValidInputSuperPostData, superPostDataFromInputs } from '@util/prisma/actions/admin';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';



export async function POST(req: NextRequest) {
    try {
        console.log("AAA");
        const authTokenCookie = cookies().get('authtoken');
        console.log("BBB", authTokenCookie);
        const resPermissions = await isAdmin(authTokenCookie);
        console.log("CCC", resPermissions)
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        console.log("DDD")
        // For TypeScript:
        const adminPrisma = await getRedactedUserFromAuth((authTokenCookie as any).value);
        console.log("EEE", adminPrisma)
        if (!adminPrisma)return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const { inputData } = await req.json();
        console.log("FFF", inputData)
        if (!inputData) return NextResponse.json({ cStatus: 101, msg: `No inputData provided.` }, { status: 400 });

        const resValidPost = isValidInputSuperPostData(inputData);
        console.log("GGG", resValidPost)
        console.log("HHH", typeof resValidPost)
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });
        const postData = superPostDataFromInputs(inputData);

        console.log("III", postData)
        const postId = await createSuperPost(postData, adminPrisma.id);
        console.log("JJJ", postId);
        
        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}