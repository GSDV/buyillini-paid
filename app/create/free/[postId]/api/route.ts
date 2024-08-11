import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth, subtractFreeMonths } from '@util/prisma/actions/user';
import { createFreePost, deleteDraftedPosts, getPost, markPostActive } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';
import { getPostData, isValidPostData } from '@util/api/posts';



// Used for storing post data before the post is confirmed.
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const postData = getPostData(formData);

        if (!postData) return NextResponse.json({ cStatus: 101, msg: `Some fields are missing or invalid.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const resValidPost = isValidPostData(postData);
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });

        if (userPrisma.freeMonths < postData.userFreeMonths) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        await deleteDraftedPosts(userPrisma.id)
        console.log("postData: ", postData)
        const postId = await createFreePost(postData, userPrisma.id);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



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
        if (postPrisma.isPaid) return NextResponse.json({ cStatus: 431, msg: `This post is a paid post.` }, { status: 400 });
        if (userPrisma.freeMonths < postPrisma.freeMonthsUsed) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        await subtractFreeMonths(userPrisma.id, postPrisma.freeMonthsUsed);
        await markPostActive(postId);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Get unactive post so that user can confirm it
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