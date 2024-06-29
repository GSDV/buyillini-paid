import { NextRequest, NextResponse } from 'next/server';

import { changePassword, getUser } from '@util/prisma/actions/user';
import { getRpToken } from '@util/prisma/actions/tokens';

import { hashPassword, isValidPassword } from '@util/api/user';
import { isRPTokenExpired } from '@util/api/tokens';



// Reset Password Token and new password have been provided, and now the account's password must be updated
export async function POST(req: NextRequest) {
    try {
        const { rpToken, newPassword } = await req.json();
        if (!isValidPassword(newPassword)) return NextResponse.json({ cStatus: 102, msg: `Use a password with 5 to 50 characters, consisting only of letters, numbers, and the symbols #, $, %, and &.` }, { status: 400 });
        
        if (!rpToken) return NextResponse.json({ cStatus: 101, msg: `No reset password token provided.`}, { status: 400 });
        const rpTokenPrisma = await getRpToken(rpToken);
        if (!rpTokenPrisma) return NextResponse.json({ cStatus: 501, msg: `Did not provide a real reset password token.` }, { status: 400 });
        if (isRPTokenExpired(rpTokenPrisma)) return NextResponse.json({ cStatus: 502, msg: `This reset password token has expired.` }, { status: 400 });

        const userPrisma = await getUser(rpToken.userId);
        // Since we found a real token, there must be a real user associated with it. So the following should in theory never run, but just in case
        if (!userPrisma) return NextResponse.json({ cStatus: 400, msg: `Unknown server error.`}, { status: 400 });

        const hashedPassword = await hashPassword(newPassword);
        if (userPrisma.password === hashedPassword) return NextResponse.json({ cStatus: 102, msg: `New password cannot be the same as current one.` }, { status: 400 });

        await changePassword(userPrisma.id, hashedPassword);

        return NextResponse.json({ cStatus: 200, msg: `Password reset. You can now login.` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${error}` }, { status: 400 });
    }
}