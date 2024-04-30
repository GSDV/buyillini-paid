import prisma from '@util/prisma/client';
import { DOMAIN } from '@util/env';

import { NextRequest, NextResponse } from 'next/server';

import { isValidEmail, allFieldsPresent, hashPassword, validPassword } from '@util/api/user';
import { CONTACT_EMAIL } from '@util/env';


import { sendEmail } from '@util/api/email';
import { createActivateToken } from '@util/api/verification';



// User is trying to sign up
// Their account will be created AND a verification email will be automatically sent (they will NOT be redirected to "verification/")
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userData } = body;

    if (!userData) return NextResponse.json({ cStatus: 101, msg: `No itemData provided. Refresh this page.` }, { status: 400 });

    if (!allFieldsPresent(userData)) return NextResponse.json({ cStatus: 101, msg: `Some data fields are missing.` }, { status: 400 });

    if (!isValidEmail(userData.email)) return NextResponse.json({ cStatus: 102, msg: `Please use your "@illinois.edu" email.` }, { status: 400 });

    if (userData.password.length < 5) return NextResponse.json({ cStatus: 102, msg: `Use a password with 5 or more characters.` }, { status: 400 });
    if (userData.password.length >= 50) return NextResponse.json({ cStatus: 102, msg: `Use a password with less than 50 characters.` }, { status: 400 });
    if (!validPassword(userData.password)) return NextResponse.json({ cStatus: 102, msg: `Use a password with only letters, numbers, and #, $, %, and &.` }, { status: 400 });


    const existingUser = await prisma.user.findUnique({
        where: {email: userData.email}
    });


    if (existingUser != null) {
        if (existingUser.banned) return NextResponse.json({ cStatus: 410, msg: `This account has been banned: ${existingUser.banMsg}` }, { status: 400 });
        if (existingUser.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Please email ${CONTACT_EMAIL} to reactivate your account.` }, { status: 400 });
        return NextResponse.json({ cStatus: 405, msg: `User already exists.` }, { status: 400 });
    }


    const passwordHash = await hashPassword(userData.password as string);

    const userCreationRes = await prisma.user.create({
        data: {
            displayName: userData.displayName,
            email: userData.email,
            password: passwordHash,
            freeMonths: 3
        }
    });


    const token = createActivateToken(userCreationRes.id);

    const msgText = `BuyIllini Verification. Copy and past the following link into your browser to activate your BuyIllini account: ${DOMAIN}/verification/${token}.`;
    const msgHTML = `
        <h1>BuyIllini Verification</h1>
        <p>Click <a href="${DOMAIN}/verification/${token}">here</a> to activate your BuyIllini account.</p>
        <p>If the above link does not work, copy and past the following into your browser: ${DOMAIN}/verification/${token}</p>
    `;

    const mail = {
        email: userData.email,
        subject: 'Activate Your BuyIllini Account',
        msgText: msgText,
        msgHTML: msgHTML
    };

    const sgCode = await sendEmail(mail);
    if (sgCode!=200 && sgCode!=201 && sgCode!=204) NextResponse.json({ cStatus: 801, msg: `Unknown email error. Please try again in a few minutes.` }, { status: 400 });

    return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
}