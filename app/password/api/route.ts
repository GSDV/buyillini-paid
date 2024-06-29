import { NextRequest, NextResponse } from 'next/server';

import { CONTACT_EMAIL } from '@util/global';

import { getUserWithRpTokens } from '@util/prisma/actions/user';
import { createRpToken } from '@util/prisma/actions/tokens';

import { isValidEmail } from '@util/api/user';
import { sendResetPasswordEmail } from '@util/api/email';
import { isLastRPTokenExpired } from '@util/api/tokens';



// User is trying to reset password, so we need to create a token for it and send an email.
// An account does NOT need to be active in order to request a password reset.
export async function POST(req: NextRequest) {
    try {
        const { userEmail } = await req.json();
        if (!userEmail) return NextResponse.json({ cStatus: 101, msg: `Did not provide email.` }, { status: 400 });
        if (!isValidEmail(userEmail)) return NextResponse.json({ cStatus: 102, msg: `Use your illinois email.` }, { status: 400 });

        const userPrisma = await getUserWithRpTokens(userEmail);
        if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `User does not exist. Sign up.` }, { status: 400 });
        if (userPrisma.banned) return NextResponse.json({ cStatus: 410, msg: `This account has been banned: ${userPrisma.banMsg}` });
        if (userPrisma.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Please email ${CONTACT_EMAIL} to reactivate your account.` });

        if (!isLastRPTokenExpired(userPrisma.rpTokens)) return NextResponse.json({ cStatus: 0, msg: `A reset password token has already been sent to your email. Please wait before sending another.` }, { status: 400 });

        const rpToken = await createRpToken(userPrisma.id);
        const sgCode = await sendResetPasswordEmail(userEmail, rpToken);
        if (sgCode!=200 && sgCode!=201 && sgCode!=204) NextResponse.json({ cStatus: 801, msg: `Unknown email error. Please try again in a few minutes.` }, { status: 400 });

        return NextResponse.json({ cStatus: 200, msg: `Reset password email sent! Check your inbox and click the link.` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${error}` }, { status: 400 });
    }
}