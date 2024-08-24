import { isValidUser } from '@util/api/auth';
import { markPostPaid } from '@util/prisma/actions/payment';
import { getPost, getPostWithPayment, markPostActive } from '@util/prisma/actions/posts';
import { getRedactedUserFromAuth, subtractFreeMonths } from '@util/prisma/actions/user';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';



const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



// Used to check if the Stripe payment was successful, and then mark active and subtract free months
export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `User does not exist. Sign up.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });
        
        const postPrisma = await getPostWithPayment(params.postId);

        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `Post does not exist.` }, { status: 400 });
        if (userPrisma.id != postPrisma.sellerId) return NextResponse.json({ cStatus: 999, msg: `Not your post.` }, { status: 400 });
        if (!postPrisma.payment) return NextResponse.json({ cStatus: 601, msg: `Payment intent does not exist.` }, { status: 400 });
        if (postPrisma.payment.successfullyPaid==true) return NextResponse.json({ cStatus: 602, msg: `Post was already paid for.` }, { status: 400 });

        const session = await stripe.checkout.sessions.retrieve(postPrisma.payment.stripeSessionId);
        if (session.payment_status!='paid') return NextResponse.json({ cStatus: 602, msg: `Post has not been paid for.` }, { status: 400 });

        if (postPrisma.freeMonthsUsed>userPrisma.freeMonths) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        await markPostPaid(postPrisma.payment.id);
        await subtractFreeMonths(userPrisma.id, postPrisma.freeMonthsUsed);
        await markPostActive(params.postId);

        return NextResponse.json({ cStatus: 200, msg: `Success` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}