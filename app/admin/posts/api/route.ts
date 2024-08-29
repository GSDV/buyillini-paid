import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getUser, banUser, updateUser, deleteUser, isAdmin, markDeleteUser, deletePost } from '@util/prisma/actions/admin';
import { addFreeMonthsToUser } from '@util/prisma/actions/user';
import { markDeletePost } from '@util/prisma/actions/posts';



export async function DELETE(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const { operation, data } = await req.json();

        switch (operation) {
            case 'MARK_DELETE_POST':
                await markDeletePost(data.postId);
                break;
            case 'DELETE_POST':
                await deletePost(data.postId);
                break;
            default:
                return NextResponse.json({ cStatus: 110, msg: `Unknown operation.` }, { status: 400 });
        }

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    }  catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}