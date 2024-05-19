import prisma from '@util/prisma/client';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getUserFromAuth } from '@util/api/auth';



export async function POST(req: NextRequest) {
    const body = await req.json();
    const { promoCode } = body;

    const authTokenCookie = cookies().get('authtoken');
    if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

    const userPrisma = await getUserFromAuth(authTokenCookie.value);
    if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });

    if (!promoCode) return NextResponse.json({ cStatus: 101, msg: `Please enter a promo code.` }, { status: 400 });
    if (promoCode=='') return NextResponse.json({ cStatus: 101, msg: `Please enter a promo code.` }, { status: 400 });
    
    if (userPrisma.promoCodes.includes(promoCode)) return NextResponse.json({ cStatus: 421, msg: `You already entered this promo code.` }, { status: 400 });

    const promoCodePrisma = await prisma.promoCode.findFirst({
        where: {code: promoCode}
    });
    if (!promoCodePrisma) return NextResponse.json({ cStatus: 420, msg: `Promo code does not exist.` }, { status: 400 });

    const updateUser = await prisma.user.update({
        where: {id: userPrisma.id},
        data: {
            promoCodes: {push: promoCode},
            freeMonths: userPrisma.freeMonths + promoCodePrisma.freeMonths
        }
    });

    if (promoCodePrisma.freeMonths==1) return NextResponse.json({ cStatus: 200, msg: `Success, ${promoCodePrisma.freeMonths} free month has been added to your account.` }, { status: 200 });
    return NextResponse.json({ cStatus: 200, msg: `Success, ${promoCodePrisma.freeMonths} free months have been added to your account.` }, { status: 200 });
}