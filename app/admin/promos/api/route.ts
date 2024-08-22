import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getUser, isAdmin, makePromoCode, deletePromoCode } from '@util/prisma/actions/admin';
import { getPromoCode } from '@util/prisma/actions/promo';



export async function GET(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const searchParams = req.nextUrl.searchParams;
        const operation = searchParams.get('operation');
        const encodedData = searchParams.get('data');
        const data = JSON.parse(encodedData as string);
        
        const responseData: { [key: string]: any } = {};

        switch (operation) {
            case 'GET_PROMO':
                const promoPrisma = await getPromoCode(data.promoCode);
                responseData.promo = promoPrisma;
                break;
            default:
                return NextResponse.json({ cStatus: 110, msg: `Unknown operation.` }, { status: 400 });
        }

        return NextResponse.json({ cStatus: 200, msg: `Success.`, data: responseData }, { status: 200 });
    }  catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



export async function POST(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const { operation, data } = await req.json();

        switch (operation) {
            case 'MAKE_PROMO':
                await makePromoCode(data.promoCode, data.eligibleUsers, data.freeMonths);
                break;
            default:
                return NextResponse.json({ cStatus: 110, msg: `Unknown operation.` }, { status: 400 });
        }

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    }  catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}





export async function DELETE(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const { operation, data } = await req.json();

        switch (operation) {
            case 'DELETE_PROMO':
                await deletePromoCode(data.promoCode);
                break;
            default:
                return NextResponse.json({ cStatus: 110, msg: `Unknown operation.` }, { status: 400 });
        }

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    }  catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}