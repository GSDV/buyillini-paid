import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getUser, banUser, updateUser, deleteUser, isAdmin, markDeleteUser } from '@util/prisma/actions/admin';
import { addFreeMonthsToUser } from '@util/prisma/actions/user';



export async function GET(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const searchParams = req.nextUrl.searchParams;
        const operation = searchParams.get('operation');
        const encodedData = searchParams.get('data');
        const data = JSON.parse(encodedData as string);

        switch (operation) {
            case 'GET_USER':
                const userPrisma = await getUser({ netId: data.netId });
                return NextResponse.json({ cStatus: 200, msg: `Success.`, user: userPrisma }, { status: 200 });
            default:
                return NextResponse.json({ cStatus: 110, msg: `Unknown operation.` }, { status: 400 });
        }

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    }  catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



export async function PUT(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const { operation, data } = await req.json();

        switch (operation) {
            // For now, update directly in supabase
            // case 'MAKE_ADMIN':
            //     const adminData = { role: 'ADMIN' };
            //     await updateUser({ netId: data.netId }, adminData);
            //     break;
            // case 'UNMAKE_ADMIN':
            //     const userData = { role: 'USER' };
            //     await updateUser({ netId: data.netId }, userData);
            //     break;
            case 'ADD_FREE_MONTHS':
                await addFreeMonthsToUser({ netId: data.netId }, data.freeMonths);
                break;
            case 'UNBAN_USER':
                const unbanData = { banned: false, banMsg: '', banExpiration: null };
                await updateUser({ netId: data.netId }, unbanData);
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
            case 'MARK_DELETE_USER':
                await markDeleteUser({ netId: data.netId });
                break;
            case 'DELETE_USER':
                await deleteUser({ netId: data.netId });
                break;
            case 'BAN_USER':
                const expiration = data.expiration==null ? null : new Date(data.expiration);
                await banUser({ netId: data.netId }, data.msg, expiration);
                break;
            default:
                return NextResponse.json({ cStatus: 110, msg: `Unknown operation.` }, { status: 400 });
        }

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    }  catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}