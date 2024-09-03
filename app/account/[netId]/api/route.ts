import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { CONTACT_EMAIL, DOMAIN } from '@util/global';

import { getRedactedUserFromAuth, getRedactedUserWithItems, markUserAsDeleted } from '@util/prisma/actions/user';

import { isValidUser } from '@util/api/auth';



// Check if real, valid account and fetch data
export async function GET(req: NextRequest, { params }: { params: { netId: string } }) {
    try {
        const accountNetId = params.netId;
        const accountPrisma = await getRedactedUserWithItems({netId: accountNetId});

        if (!accountPrisma) return NextResponse.json({ cStatus: 404, msg: `User does not exist. Sign up.` }, { status: 400 });
        if (!accountPrisma.active) return NextResponse.json({ cStatus: 412, msg: `This account is not active. Please go to ${DOMAIN}/activate.` }, { status: 400 });
        if (accountPrisma.banned) return NextResponse.json({ cStatus: 410, msg: `This account has been banned: ${accountPrisma.banMsg}` }, { status: 400 });
        if (accountPrisma.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Please email ${CONTACT_EMAIL} to reactivate your account.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (authTokenCookie != null) {
            const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
            // If logged in user is looking at own account
            if (userPrisma!=null && userPrisma.netId==accountNetId) return NextResponse.json({ cStatus: 202, msg: `Success (own account).`, userData: accountPrisma }, { status: 200 });
            
            accountPrisma.posts = accountPrisma.posts.filter(post => post.active);
            return NextResponse.json({ cStatus: 200, msg: `Success (other account, viewer is logged in).`, userData: accountPrisma }, { status: 200 });
        }
        
        // Hide phone number of an account from a non-logged-in user.
        accountPrisma.posts = accountPrisma.posts.filter(post => post.active);
        // accountPrisma.phoneNumber = '';
        
        return NextResponse.json({ cStatus: 205, msg: `Success (other account, viewer is logged out).`, userData: accountPrisma }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Deleting account
export async function DELETE(req: NextRequest, { params }: { params: { netId: string } }) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });

        const netId = params.netId;
        if (netId===null || netId==="") return NextResponse.json({ cStatus: 101, msg: `Missing netId.` }, { status: 400 });
        if (netId!=userPrisma.netId) return NextResponse.json({ cStatus: 102, msg: `NetId does not match logged in user.` }, { status: 400 });

        const resValid = isValidUser(userPrisma);
        if (!resValid.valid) return NextResponse.json(resValid.nextres, { status: 400 });

        await markUserAsDeleted(userPrisma.id);
        cookies().set('authtoken', '');
        return NextResponse.json({ cStatus: 200, msg: `Your account has been deleted.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 906, msg: `Server error: ${err}` }, { status: 400 });
    }
}