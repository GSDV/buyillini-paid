import { NextRequest } from 'next/server';
import { markDeleteAllExpiredPosts } from '@util/prisma/actions/posts';



export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', {status: 401});

        const count = await markDeleteAllExpiredPosts();
        console.log(`Marked ${count} expired posts as deleted.`)

        return Response.json({ success: true });
    }  catch (err) {
        console.log(`Error marking expired posts as deleted: ${err}`)
        return Response.json({ success: false }, { status: 400 });
    }
}