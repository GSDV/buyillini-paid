import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { PostData, createFreePost, getPost, markPostActive } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';
import { isValidPost } from '@util/api/posts';



// Used for storing post data before the post is confirmed.
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const postData = getPostData(formData);
        console.log(postData);

        if (!postData) return NextResponse.json({ cStatus: 101, msg: `Invalid postData provided. Refresh page.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const resValidPost = isValidPost(postData);
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 102, msg: resValidPost.msg }, { status: 400 });

        if (userPrisma.freeMonths < postData.userFreeMonths) return NextResponse.json({ cStatus: 102, msg: `Not enough free months.` }, { status: 400 });

        const postId = await createFreePost(postData, userPrisma.id);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}.` }, { status: 400 });
    }
}

function getPostData(formData: FormData) {
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const size = formData.get('size');
    const gender = formData.get('gender');
    const price = formData.get('price');
    const images = formData.getAll('images') as File[];
    const months = formData.get('months');
    const userFreeMonths = formData.get('userFreeMonths');

    if (!title || !description || !category || !size || !gender || !price || !images || !months) return null;

    const postData: PostData = {
        title: title as string,
        description: description as string,
        category: category as string,
        size: size as string,
        gender: gender as string,
        price: Math.round(Number(price)*100)/100,
        images: formData.getAll('images') as File[],
        months: Math.floor(Number(months)),
        userFreeMonths: Math.floor(Number(userFreeMonths))
    }
    return postData;
}



// After confirming the post, mark it active and redirect to newly created post.
export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const postId = params.postId;

        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const postPrisma = await getPost(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `This post does not exist.` }, { status: 400 });
        if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 414, msg: `This is not your post.` }, { status: 400 });
        if (postPrisma.active) return NextResponse.json({ cStatus: 201, msg: `This post is already active.` }, { status: 400 });

        await markPostActive(postId);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}.` }, { status: 400 });
    }
}