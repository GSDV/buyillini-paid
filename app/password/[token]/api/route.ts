import prisma from '@util/prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { NextRequest, NextResponse } from 'next/server';

import { isRPTokenExpired } from '@util/api/reset-password';
import { hashPassword } from '@util/api/user';



// Reset Password Token and new password have been provided, and now the account's password must be updated
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userToken, userNewPassword } = body;

    if (!userToken) return NextResponse.json({ cStatus: 101, msg: `No reset password token provided.`}, { status: 400 });

    const tokenPrisma = await prisma.rPToken.findFirst({
        where: { token: userToken },
        include: { user: true }
    });

    if (tokenPrisma == null) return NextResponse.json({ cStatus: 501, msg: `Provided token is not real.`}, { status: 400 });
    if (isRPTokenExpired(tokenPrisma)) return NextResponse.json({ cStatus: 502, msg: `Provided token is expired.`}, { status: 400 });

    const userPrisma = await prisma.user.findUnique({
        where: { id: tokenPrisma.userId }
    });

    // Since we found a real token, there must be a real user associated with it. So the following should in theory never run, but just in case
    if (userPrisma == null) return NextResponse.json({ cStatus: 400, msg: `Unknown server error.`}, { status: 400 });


    const hashedPassword = await hashPassword(userNewPassword);

    try {
        const updatedInstance = await prisma.user.update({
            where: { id: userPrisma.id },
            data: { password: hashedPassword }
        });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) return NextResponse.json({ cStatus: 905, msg: `Update Prisma error: ${error.message}` }, { status: 400 });
        return NextResponse.json({ cStatus: 900, msg: `Unknown Prisma error: ${error}` }, { status: 400 });
    }


    return NextResponse.json({ cStatus: 200, msg: `Password reset. You can now login.` }, { status: 200 });
}