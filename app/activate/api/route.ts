import { NextRequest, NextResponse } from 'next/server';

import { getUserWithActivationTokens, createActivateToken } from '@util/prisma/actions';

import { isLastTokenExpired } from '@util/api/verification';
import { isValidEmail } from '@util/api/user';
import { sendEmail } from '@util/api/email';

import { domain } from '@util/global';



// This should only be used if user misses the first verification email and wants another one
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email } = body;

    if (!email) return NextResponse.json({ cStatus: 101, msg: `No email provided.` }, { status: 400 });
    if (email=='') return NextResponse.json({ cStatus: 101, msg: `Missing email.` }, { status: 400 });

    if (!isValidEmail(email)) return NextResponse.json({ cStatus: 102, msg: `Provide a Univeristy of Illinois email.` }, { status: 400 });

    let userPrisma = null;
    try {
        userPrisma = await getUserWithActivationTokens(email);
    } catch (err) { return NextResponse.json({ cStatus: 900, msg: `Prisma error: ${err}.` }, { status: 400 }); }

    if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `No user assigned with this email, please sign up.` }, { status: 400 });
    if (userPrisma.banned) return NextResponse.json({ cStatus: 410, msg: `This user is banned.` }, { status: 400 });
    if (userPrisma.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Email ${email}.` }, { status: 400 });
    if (!userPrisma.active) return NextResponse.json({ cStatus: 401, msg: `This account is already active.` }, { status: 400 });

    if (!isLastTokenExpired(userPrisma.activateTokens)) return NextResponse.json({ cStatus: 510, msg: `A verification email has already been sent. check your email or wait before sending another one.` }, { status: 400 });

    const token = await createActivateToken(userPrisma.id);

    const msgText = `BuyIllini Verification. Copy and past the following link into your browser to activate your BuyIllini account: ${domain}/activate/${token}.`;
    const msgHtml = `
        <h1>BuyIllini Verification</h1>
        <p>Click <a href="${domain}/activate/${token}">here</a> to activate your BuyIllini account.</p>
        <p>If the above link does not work, copy and past the following into your browser: ${domain}/activate/${token}</p>
    `;
    const mail = {
        email: userPrisma.email,
        subject: 'Activate Your BuyIllini Account',
        msgText: msgText,
        msgHtml: msgHtml
    };
    const sgCode = await sendEmail(mail);
    if (sgCode!=200 && sgCode!=201 && sgCode!=204) NextResponse.json({ cStatus: 801, msg: `Unknown email error. Please try again in a few minutes.` }, { status: 400 });
   
    return NextResponse.json({ cStatus: 200, msg: `Verification email sent! Check your email and click the account activation link.` }, { status: 200 });
}