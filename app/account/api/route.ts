import prisma from '@util/prisma/client';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { deleteUser, getUserFromAuth, logOut } from '@util/prisma/actions';

import { deleteFromS3, uploadPfp } from '@util/s3/aws';

import { isValidUser } from '@util/api/auth';

import { isValidPhoneNumber } from '@util/api/user'; 


import { acceptedFiles } from '@util/global';




// Update account (settings form)
export async function POST(req: NextRequest) {
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
        if (!acceptedFiles.includes(pfp.type)) return NextResponse.json({ cStatus: 102, msg: `Please upload a png, jpg, or webp file.` }, { status: 400 });
        if (pfp.size > 5000000) return NextResponse.json({ cStatus: 102, msg: `Please upload a picture under 5 MBs.` }, { status: 400 });

        const pfpBytes = await pfp.arrayBuffer();
        const buffer = Buffer.from(pfpBytes);
        try {
            if (userPrisma.profilePicture != null) await deleteFromS3(userPrisma.profilePicture);
            const pfpKey = await uploadPfp(buffer);
            userUpdateData.profilePicture = pfpKey;
        }
        catch(err) { return NextResponse.json({ cStatus: 700, msg: `Unknown S3 error: ${err}. Please refresh the page.` }, { status: 400 }); }
    }

    await prisma.user.update({
        where: { id: userPrisma.id },
        data: userUpdateData
    });

    return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
}



// Deleting account
export async function DELETE(req: NextRequest) {
    const authTokenCookie = cookies().get('authtoken');
    if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

    const userPrisma = await getUserFromAuth(authTokenCookie.value);
    if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `User does not exist.` }, { status: 400 });

    try {
        deleteUser(userPrisma.id);
    } catch (err) { return NextResponse.json({ cStatus: 906, msg: `Error deleting account: ${err}.` }, { status: 400 }); }
    return NextResponse.json({ cStatus: 200, msg: `Your account has been deleted.` }, { status: 200 });
}



// Logging out
export async function PUT(req: NextRequest) {
    const authTokenCookie = cookies().get('authtoken');
    if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

    cookies().set('authtoken', '');
    try {
        logOut(authTokenCookie.value);
    } catch (err) { return NextResponse.json({ cStatus: 900, msg: `Error logging out: ${err}.` }, { status: 400 }); }
    return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
}