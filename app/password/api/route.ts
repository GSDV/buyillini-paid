import prisma from '@util/prisma/client';

import sgMail from '@sendgrid/mail';

import { CONTACT_EMAIL, DOMAIN, SENDGRID_API_KEY, SENGRID_EMAIL } from '@util/env';

import { v4 as uuidv4 } from 'uuid';

import { NextRequest, NextResponse } from 'next/server';

import { isValidEmail } from '@util/api/user';
import { isLastRPTokenExpired } from '@util/api/reset-password';



// User is trying to reset password, so we need to create a token for it and send an email.
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userData } = body;
    if (!userData) return NextResponse.json({ cStatus: 101, msg: `User data not provided.` }, { status: 400 });

    const { userEmail } = userData;
    if (!userEmail) return NextResponse.json({ cStatus: 101, msg: `Some data fields are empty.` }, { status: 400 });

    if (!isValidEmail(userEmail)) return NextResponse.json({ cStatus: 102, msg: `Use your illinois email.` }, { status: 400 });

    const userPrisma = await prisma.user.findUnique({
        where: {email: userEmail},
        include: {rpTokens: true}
    });

    if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `Account does not exist. Please sign up.` }, { status: 400 });
    
    if (userPrisma.banned) return NextResponse.json({ cStatus: 404, msg: `This account has been banned: ${userPrisma.banMsg}` }, { status: 400 });
    if (userPrisma.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Please email ${CONTACT_EMAIL} to reactivate your account.` }, { status: 400 });

    if (!isLastRPTokenExpired(userPrisma.rpTokens)) return NextResponse.json({ cStatus: 0, msg: `A reset password token has already been sent to your email. Please wait before sending another.` }, { status: 400 });

    const token = uuidv4();
    const tokenCreationRes = await prisma.rPToken.create({
        data: {
            token: token,
            user: {
                connect: {
                    id: userPrisma.id
                }
            }
        }
    });

    sgMail.setApiKey(SENDGRID_API_KEY);

    const msgText = `BuyIllini Reset Password. Copy and past the following link into your browser to reset your account password: ${DOMAIN}/password/${token}.`;
    const msgHTMl = `
        <h1>BuyIllini Reset Password</h1>
        <p>Click <a href="${DOMAIN}/verification/${token}">here</a> to reset your BuyIllini password.</p>
        <p>If the above link does not work, copy and past the following into your browser: ${DOMAIN}/password/${token}</p>
    `;

    const msg = {
        to: userPrisma.email,
        from: SENGRID_EMAIL,
        subject: 'Reset Your BuyIllini Account Password',
        text: msgText,
        html: msgHTMl
    };

    const mailres = await sgMail.send(msg);
    const sgCode = mailres[0].statusCode;
    if (sgCode!=200 && sgCode!=201 && sgCode!=204) NextResponse.json({ cStatus: 801, msg: `Unknown email error. Please try again in a few minutes.` }, { status: 400 });


    return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
}