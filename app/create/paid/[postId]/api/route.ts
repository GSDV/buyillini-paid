import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth, subtractFreeMonths } from '@util/prisma/actions/user';
import { createPaidPost, deleteDraftedPosts, getPost, markPostActive } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';
import { getPostData, isValidPostData } from '@util/api/posts';
import { DOMAIN } from '@util/global';
import { addPaymentToPost, deleteAllFailedPostPayments } from '@util/prisma/actions/payment';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// need to look into this
// Used for storing post data before the post is confirmed.
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        console.log("AA")
        const postData = getPostData(formData);

        console.log("BB")

        if (!postData) return NextResponse.json({ cStatus: 101, msg: `Some fields are missing or invalid.` }, { status: 400 });

        console.log("CC")
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        console.log("DD")
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        console.log("EE")
        const resValidPost = isValidPostData(postData);
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });

        console.log("FF")
        if (userPrisma.freeMonths < postData.userFreeMonths) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        console.log("GG")
        await deleteDraftedPosts(userPrisma.id)
        console.log("BBB")
        const postId = await createPaidPost(postData, userPrisma.id);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Make a payment intent and redirect user to Stripe external checkout
export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const postId = params.postId;

        console.log("AAA")

        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        console.log("BBB")
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        console.log("CCC")
        const postPrisma = await getPost(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `This post does not exist.` }, { status: 400 });
        if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 414, msg: `This is not your post.` }, { status: 400 });
        if (postPrisma.active) return NextResponse.json({ cStatus: 201, msg: `This post is already active.`, postId: postId }, { status: 400 });
        if (!postPrisma.isPaid) return NextResponse.json({ cStatus: 431, msg: `This post is a free post.` }, { status: 400 });
        if (userPrisma.freeMonths < postPrisma.freeMonthsUsed) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        console.log("DDD")
        const months = postPrisma.duration - postPrisma.freeMonthsUsed;

        console.log("EEE")
        const session = await stripe.checkout.sessions.create({
            line_items: [ { price: process.env.STRIPE_BUYILLINI_ONE_MONTH_PRICE_ID, quantity: months } ],
            mode: 'payment',
            success_url: `${DOMAIN}/create/paid/${postPrisma.id}/stripe/success`,
            cancel_url: `${DOMAIN}/create/paid/${postPrisma.id}/stripe/error`,
            automatic_tax: { enabled: true }
        });
        console.log("FFF")
        console.log("STRIPE SESSION: ", session)
        console.log("STRIPE SESSION: ", session.id)
        
        await deleteAllFailedPostPayments(postPrisma.id);
        await addPaymentToPost(postPrisma.id, session.id, months);

        console.log("GGG")

        return NextResponse.json({ cStatus: 200, msg: `Success.`, sessionUrl: session.url }, { status: 200 });
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
        if (!postPrisma.isPaid) return NextResponse.json({ cStatus: 431, msg: `This post is a free post.` }, { status: 400 });

        return NextResponse.json({ cStatus: 200, msg: `Success.`, draftedPost: postPrisma }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}