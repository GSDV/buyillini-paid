import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { CONTACT_EMAIL, DOMAIN } from '@util/global';

import { createUser, getRedactedUser, getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { createActivateToken, createAuthToken } from '@util/prisma/actions/tokens';

import { isValidEmail, allFieldsPresent, isValidPassword } from '@util/api/user';
import { sendActivationEmail } from '@util/api/email';
import { isValidUser } from '@util/api/auth';



// When loading the signup page, we will first see if the user is already logged in
export async function GET(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 200, msg: `User is not logged in.` }, { status: 200 });
        const user = await getRedactedUserFromAuth(authTokenCookie.value);
        const resValidUser = isValidUser(user);
        if (!resValidUser.valid) {
            if (resValidUser.nextres?.cStatus==412) return NextResponse.json({ cStatus: 201, msg: `Account is logged in but inactive.`, netId: (user as any).netId }, { status: 200 });
            return NextResponse.json(resValidUser.nextres, { status: 200 });
        }
        return NextResponse.json({ cStatus: 201, msg: `User is already logged in.`, netId: (user as any).netId }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// User is trying to sign up
// Their account will be created AND a verification email will be automatically sent
export async function POST(req: NextRequest) {
    try {
        const { userData } = await req.json();

        if (!userData) return NextResponse.json({ cStatus: 101, msg: `No itemData provided. Refresh this page.` }, { status: 400 });

        if (!allFieldsPresent(userData)) return NextResponse.json({ cStatus: 101, msg: `Some data fields are missing.` }, { status: 400 });

        if (!isValidEmail(userData.email)) return NextResponse.json({ cStatus: 102, msg: `Please use your "@illinois.edu" email.` }, { status: 400 });
        if (!isValidPassword(userData.password)) return NextResponse.json({ cStatus: 102, msg: `Use a password with 5 to 50 characters, consisting only of letters, numbers, and the symbols #, $, %, and &.` }, { status: 400 });

        const existingUser = await getRedactedUser({email: userData.email});
        if (existingUser != null) {
            if (existingUser.banned) return NextResponse.json({ cStatus: 410, msg: `This account has been banned: ${existingUser.banMsg}` }, { status: 400 });
            if (existingUser.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Please email ${CONTACT_EMAIL} to reactivate your account.` }, { status: 400 });
            return NextResponse.json({ cStatus: 405, msg: `User already exists.` }, { status: 400 });
        }

        const userId = await createUser(userData.displayName, userData.email, userData.password);
        const activationToken = await createActivateToken(userId);

        const sgCode = await sendActivationEmail(userData.email, activationToken);
        if (sgCode!=200 && sgCode!=201 && sgCode!=204) NextResponse.json({ cStatus: 801, msg: `Unknown email error. Please try again in a few minutes.` }, { status: 400 });

        // User is logged in, but won't be allowed to do much.
        // This saves user from having to type login info again after verification email.
        const authToken = await createAuthToken(userId);
        cookies().set('authtoken', authToken);

        return NextResponse.json({ cStatus: 200, msg: `Success. Check your email to activate your account.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}