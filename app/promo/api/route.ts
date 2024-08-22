import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { claimPromoCode, getPromoCode } from '@util/prisma/actions/promo';



export async function POST(req: NextRequest) {
    try {
        const { promoCode } = await req.json();

        if (!promoCode || promoCode==='') return NextResponse.json({ cStatus: 101, msg: `Please enter a promo code.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });

        if (userPrisma.promoCodes.includes(promoCode)) return NextResponse.json({ cStatus: 421, msg: `You already claimed this promo code.` }, { status: 400 });

        const promoCodePrisma = await getPromoCode(promoCode);
        if (!promoCodePrisma) return NextResponse.json({ cStatus: 420, msg: `Promo code does not exist.` }, { status: 400 });

        const eligibleUsers = promoCodePrisma.eligibleUsers;
        if (eligibleUsers.length!=0 && !eligibleUsers.includes(userPrisma.netId)) return NextResponse.json({ cStatus: 0, msg: `You are not eligible for this promo code.` }, { status: 400 });

        try {
            await claimPromoCode(userPrisma.id, promoCodePrisma);
        } catch (err) { return NextResponse.json({ cStatus: 905, msg: `Error claiming code: ${err}` }, { status: 400 }); }

        if (promoCodePrisma.freeMonths == 1) return NextResponse.json({ cStatus: 200, msg: `Nice! 1 free month has been added to your account.` }, { status: 200 });
        return NextResponse.json({ cStatus: 200, msg: `Nice! ${promoCodePrisma.freeMonths} free months have been added to your account.` }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}