import { NextRequest, NextResponse } from 'next/server';

import { getUserWithActivationTokens } from '@util/prisma/actions/user';
import { createActivateToken } from '@util/prisma/actions/tokens';

import { isValidEmail } from '@util/api/user';
import { sendActivationEmail } from '@util/api/email';
import { isLastActivationTokenExpired } from '@util/api/tokens';



// This should only be used if user misses the first verification email and wants another one
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ cStatus: 101, msg: `No email provided.` }, { status: 400 });
        if (email=='') return NextResponse.json({ cStatus: 101, msg: `Missing email.` }, { status: 400 });

        if (!isValidEmail(email)) return NextResponse.json({ cStatus: 102, msg: `Provide a Univeristy of Illinois email.` }, { status: 400 });

        let userPrisma = await getUserWithActivationTokens(email);

        if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `No user assigned with this email, please sign up.` }, { status: 400 });
        if (userPrisma.banned) return NextResponse.json({ cStatus: 410, msg: `This user is banned.` }, { status: 400 });
        if (userPrisma.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Email ${email}.` }, { status: 400 });
        if (userPrisma.active) return NextResponse.json({ cStatus: 401, msg: `This account is already active.` }, { status: 400 });

        if (!isLastActivationTokenExpired(userPrisma.activateTokens)) return NextResponse.json({ cStatus: 510, msg: `A verification email has already been sent. check your email or wait before sending another one.` }, { status: 400 });

        const token = await createActivateToken(userPrisma.id);

        const sgCode = await sendActivationEmail(userPrisma.email, token);
        if (sgCode!=200 && sgCode!=201 && sgCode!=204) NextResponse.json({ cStatus: 801, msg: `Unknown email error. Please try again in a few minutes.` }, { status: 400 });
    
        return NextResponse.json({ cStatus: 200, msg: `Verification email sent! Check your inbox and click the account activation link.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}