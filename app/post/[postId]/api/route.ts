import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { createBuyerInterest, didUserBuyPostRecently, getPostWithRedactedUser, markPostAsDeleted } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';
import { isPostValid } from '@util/api/posts';
import { sendBuyRequest } from '@util/api/email';
import { didUserAlreadyReportPost, reportPost } from '@util/prisma/actions/report';



// Fetch a post to display
export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const postId = params.postId;

        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });
        const postPrisma = await getPostWithRedactedUser(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `Post does not exist.` }, { status: 400 });
        if (!postPrisma.active) return NextResponse.json({ cStatus: 432, msg: `Post does not exist.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 200, msg: `Success (logged out).`, post: postPrisma }, { status: 200 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 200, msg: `Success (logged out).`, post: postPrisma }, { status: 200 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json({ cStatus: 200, msg: `Success (logged out).`, post: postPrisma }, { status: 200 });

        if (postPrisma.sellerId == userPrisma.id) return NextResponse.json({ cStatus: 202, msg: `Success (own post).`, post: postPrisma }, { status: 200 });
        return NextResponse.json({ cStatus: 203, msg: `Success (other post).`, post: postPrisma }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Delete this post
export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
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

        await markPostAsDeleted(postId);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Report post
export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const { msg } = await req.json();
        if (!msg || msg=='') return NextResponse.json({ cStatus: 101, msg: `No report message provided.` }, { status: 400 });
        if (msg.length>300) return NextResponse.json({ cStatus: 102, msg: `Report message needs to be under 300 characters.` }, { status: 400 });

        const postId = params.postId;
        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const postPrisma = await getPostWithRedactedUser(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `Post does not exist.` }, { status: 400 });
        if (!postPrisma.active) return NextResponse.json({ cStatus: 432, msg: `Post is not active.` }, { status: 400 });
        if (postPrisma.deleted) return NextResponse.json({ cStatus: 433, msg: `Post is deleted.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        if (userPrisma.id===postPrisma.seller.id) return NextResponse.json({ cStatus: 430, msg: `You may not report your own post.` }, { status: 400 });

        const resAlreadyReported = await didUserAlreadyReportPost(userPrisma.id, postId);
        if (resAlreadyReported) return NextResponse.json({ cStatus: 440, msg: `You have already reported this post.` }, { status: 400 });

        await reportPost(userPrisma.id, postId, msg);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Buy Post
// msg can be optional
export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const { msg } = await req.json();
        if (msg.length>300) return NextResponse.json({ cStatus: 102, msg: `Message needs to be under 300 characters.` }, { status: 400 });

        const postId = params.postId;
        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const postPrisma = await getPostWithRedactedUser(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `Post does not exist.` }, { status: 400 });
        if (!postPrisma.active) return NextResponse.json({ cStatus: 432, msg: `Post is not active.` }, { status: 400 });
        if (postPrisma.deleted) return NextResponse.json({ cStatus: 433, msg: `Post is deleted.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const buyerPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!buyerPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(buyerPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const resAlreadyBought = await didUserBuyPostRecently(buyerPrisma.id, postId);
        if (resAlreadyBought) return NextResponse.json({ cStatus: 440, msg: `You have contacted the seller about this post less than 24 hours ago.` }, { status: 400 });

        await createBuyerInterest(buyerPrisma.id, postId, msg);
        await sendBuyRequest(buyerPrisma, msg, postPrisma);
        
        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}