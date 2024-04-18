import prisma from '@util/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { isValidEmail, allFieldsPresent, hashPassword, validPassword } from '@util/api/user';



export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userData } = body;

    if (!userData) return NextResponse.json({ cStatus: 401, msg: `No itemData provided. Refresh this page.` }, { status: 400 });

    if (!allFieldsPresent(userData)) return NextResponse.json({ cStatus: 401, msg: `Some data fields are missing.` }, { status: 400 });

    if (!isValidEmail(userData.email)) return NextResponse.json({ cStatus: 401, msg: `Please use your "@illinois.edu" email.` }, { status: 400 });

    if (userData.password.length < 5) return NextResponse.json({ cStatus: 401, msg: `Use a password with 5 or more characters.` }, { status: 400 });
    if (userData.password.length >= 50) return NextResponse.json({ cStatus: 401, msg: `Use a password with less than 50 characters.` }, { status: 400 });
    if (!validPassword(userData.password)) return NextResponse.json({ cStatus: 401, msg: `Use a password with only letters, numbers, and #, $, %, and &.` }, { status: 400 });


    const existingUser = await prisma.user.findUnique({
        where: {email: userData.email}
    });

    if (existingUser != null && existingUser.banned) return NextResponse.json({ cStatus: 402, msg: `This account has been banned: ${existingUser.banMsg}` }, { status: 400 });
    if (existingUser != null && existingUser.deleted) return NextResponse.json({ cStatus: 403, msg: `This account has been deleted.` }, { status: 400 });
    if (existingUser != null) return NextResponse.json({ cStatus: 405, msg: `User already exists.` }, { status: 400 });


    const passwordHash = await hashPassword(userData.password as string);

    const userCreationRes = await prisma.user.create({
        data: {
            displayName: userData.displayName,
            email: userData.email,
            password: passwordHash,
            freeMonths: 3
        }
    });
    
    return NextResponse.json({ cStatus: 200, msg: `Success.`, data: userCreationRes }, { status: 200 });
}