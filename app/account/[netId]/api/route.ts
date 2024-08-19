import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ACCEPTED_FILES, CONTACT_EMAIL, DOMAIN } from '@util/global';

import { deleteFromS3, uploadPfp } from '@util/s3/aws';

import { getRedactedUserFromAuth, getRedactedUserWithItems, markUserAsDeleted, updateUser } from '@util/prisma/actions/user';

import { isValidUser } from '@util/api/auth';
import { isValidPhoneNumber } from '@util/api/user';



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
        console.log("authTokenCookie: ", authTokenCookie)
        if (authTokenCookie != null) {
            console.log("authTokenCookie val: ", authTokenCookie.value)
            const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
            console.log("userPrisma netid: ", userPrisma?.netId)
            console.log("account netid: ", accountNetId)
            // If logged in user is looking at own account
            if (userPrisma!=null && userPrisma.netId==accountNetId) return NextResponse.json({ cStatus: 202, msg: `Success (own account).`, userData: accountPrisma }, { status: 200 });
        }

        // Should never run, but for TypeScript
        if (!accountPrisma) return NextResponse.json({ cStatus: 404, msg: `This is account does not exist.` }, { status: 400 });
        
        accountPrisma.posts = accountPrisma.posts.filter(post => post.active);
        return NextResponse.json({ cStatus: 200, msg: `Success (other account).`, userData: accountPrisma }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Update account (settings form)
export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `User does not exist. Sign up.` }, { status: 400 });

        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        if (!data) return NextResponse.json({ cStatus: 101, msg: `No data provided. Refresh this page.` }, { status: 400 });

        const userUpdateData: any = {};

        // DISPLAY NAME
        const displayName = data.get('displayName');
        if (!displayName) return NextResponse.json({ cStatus: 101, msg: `Display name is required.` }, { status: 400 });
        userUpdateData.displayName = displayName;

        // PHONE NUMBER
        const phoneNumber = data.get('phoneNumber');
        if (phoneNumber != null) {
            const phoneStr = phoneNumber as string;
            if (!isValidPhoneNumber(phoneStr)) return NextResponse.json({ cStatus: 101, msg: `Phone number not valid. Enter 10 numbers.` }, { status: 400 });
            userUpdateData.phoneNumber = phoneStr.replace(/[() "-]/g, '');
        }

        // PFP
        const pfp = data.get('pfp');
        if (pfp instanceof File) {
            if (!ACCEPTED_FILES.includes(pfp.type)) return NextResponse.json({ cStatus: 102, msg: `Please upload a png, jpg, or webp file.` }, { status: 400 });
            if (pfp.size > 5000000) return NextResponse.json({ cStatus: 102, msg: `Please upload a picture under 5 MBs.` }, { status: 400 });

            const pfpBytes = await pfp.arrayBuffer();
            const buffer = Buffer.from(pfpBytes);
            if (userPrisma.profilePicture != null) await deleteFromS3(userPrisma.profilePicture);
            const pfpKey = await uploadPfp(buffer);
            userUpdateData.profilePicture = pfpKey;
        }
        
        updateUser(userPrisma.id, userUpdateData);
        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
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