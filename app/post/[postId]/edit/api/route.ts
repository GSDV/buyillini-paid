import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { getPost, getPostWithRedactedUser, markPostAsDeleted, updatePost } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';
import { getEditPostData, getPostData, isPostValid, isValidEditPostData, isValidPostData } from '@util/api/posts';
import { deleteFromS3 } from '@util/s3/aws';



// Fetch a post to edit
export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const postId = params.postId;
        if (!postId) return NextResponse.json({ cStatus: 102, msg: `No postId provided.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const user = await getRedactedUserFromAuth(authTokenCookie.value);
        const resValidUser = isValidUser(user);
        if (!user) return NextResponse.json({ cStatus: 402, msg: `User does not exist.` }, { status: 400 }); // For typescript
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const postPrisma = await getPost(postId);
        const validPostRes = isPostValid(postPrisma);
        if (!validPostRes.valid) return NextResponse.json(validPostRes.nextres, { status: 400 });

        return NextResponse.json({ cStatus: 200, msg: `Success.`, post: postPrisma }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Submit post edits
export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const formData = await req.formData();
        const postData = getEditPostData(formData);
        if (!postData) return NextResponse.json({ cStatus: 101, msg: `Some fields are missing or invalid.` }, { status: 400 });

        const postId = params.postId;
        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const postPrisma = await getPostWithRedactedUser(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `Post does not exist.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        if (userPrisma.id!==postPrisma.seller.id) return NextResponse.json({ cStatus: 430, msg: `This post is not yours.` }, { status: 400 });

        const validPostRes = isPostValid(postPrisma);
        if (!validPostRes.valid) return NextResponse.json(validPostRes.nextres, { status: 400 });

        const resValidPost = isValidEditPostData(postData);
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });

        for (let i=0; i<postPrisma.images.length; i++) await deleteFromS3(postPrisma.images[i]);

        await updatePost(postId, postData);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}