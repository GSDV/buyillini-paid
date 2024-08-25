import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth, subtractFreeMonths } from '@util/prisma/actions/user';
import { createFreePost, deleteDraftedPosts, getPost, markPostActive } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';
import { createPostDataFromInputs, isValidInputPostData } from '@util/api/posts';



// 1) USER INPUTS THE POST DATA
// Used for storing free post data before the post is confirmed.
export async function POST(req: NextRequest) {
    try {
        const { inputData } = await req.json();
        if (!inputData) return NextResponse.json({ cStatus: 101, msg: `No inputData provided.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const resValidPost = isValidInputPostData(inputData);
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });
        const postData = createPostDataFromInputs(inputData);
 
        if (userPrisma.freeMonths < postData.duration) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        await deleteDraftedPosts(userPrisma.id);
        const postId = await createFreePost(postData, userPrisma.id);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// 2) FETCHES UNCONFIRMED POST FOR USER
// Get unactive free post so that user can confirm it
export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const postId = params.postId;

        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const postPrisma = await getPost(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `This post does not exist.` }, { status: 400 });
        if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 414, msg: `This is not your post.` }, { status: 400 });
        if (postPrisma.active) return NextResponse.json({ cStatus: 201, msg: `This post is already active.` }, { status: 400 });
        if (postPrisma.isPaid) return NextResponse.json({ cStatus: 431, msg: `This post is a paid post.` }, { status: 400 });

        return NextResponse.json({ cStatus: 200, msg: `Success.`, draftedPost: postPrisma }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// 3) USER CONFIRMS POST
// After confirming free post, mark it active and redirect to newly created post.
export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const postId = params.postId;

        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const postPrisma = await getPost(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `This post does not exist.` }, { status: 400 });
        if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 414, msg: `This is not your post.` }, { status: 400 });
        if (postPrisma.active) return NextResponse.json({ cStatus: 201, msg: `This post is already active.`, postId: postId }, { status: 400 });
        if (postPrisma.isPaid || postPrisma.duration > postPrisma.freeMonthsUsed) return NextResponse.json({ cStatus: 431, msg: `This post is a paid post.` }, { status: 400 });
        if (userPrisma.freeMonths < postPrisma.duration) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        await subtractFreeMonths(userPrisma.id, postPrisma.freeMonthsUsed);
        await markPostActive(postId);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}
