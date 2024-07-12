import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ACCEPTED_FILES } from '@util/global';

import { deleteFromS3, uploadPfp } from '@util/s3/aws';

import { deleteUser, getUserFromAuth, updateUser } from '@util/prisma/actions/user';
import { deleteAuthToken } from '@util/prisma/actions/tokens';

import { isValidUser } from '@util/api/auth';
import { isValidPhoneNumber } from '@util/api/user'; 



// Update account (settings form)
export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getUserFromAuth(authTokenCookie.value);
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
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}.` }, { status: 400 });
    }
}



// Deleting account
export async function DELETE(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        
        const resValid = isValidUser(userPrisma);
        if (!resValid.valid) return NextResponse.json(resValid.nextres, { status: 400 });

        deleteUser(userPrisma.id);
        cookies().set('authtoken', '');
        return NextResponse.json({ cStatus: 200, msg: `Your account has been deleted.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 906, msg: `Server error: ${err}.` }, { status: 400 });
    }
}



// Logging out
export async function PUT(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        deleteAuthToken(authTokenCookie.value);
        cookies().set('authtoken', '');
        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Service error: ${err}.` }, { status: 400 });
    }
}