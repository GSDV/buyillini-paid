import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { getPost, getPostWithRedactedUser, markPostAsDeleted, updatePost } from '@util/prisma/actions/posts';

import { isValidUser } from '@util/api/auth';
import { editPostDataFromInputs, getEditPostData, isPostValid, isValidInputEditPostData } from '@util/api/posts';
import { deleteFromS3 } from '@util/s3/aws';



// Fetch a post to edit
export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const postId = params.postId;
        if (!postId) return NextResponse.json({ cStatus: 102, msg: `No postId provided.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const user = await getRedactedUserFromAuth(authTokenCookie.value);
        const resValidUser = isValidUser(user);
        if (!user) return NextResponse.json({ cStatus: 402, msg: `User does not exist.` }, { status: 400 }); // For typescript
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const postPrisma = await getPost(postId);
        const validPostRes = isPostValid(postPrisma);
        if (!validPostRes.valid) return NextResponse.json(validPostRes.nextres, { status: 400 });

        return NextResponse.json({ cStatus: 200, msg: `Success.`, post: postPrisma }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 905, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Submit post edits
export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const { inputData } = await req.json();
        if (!inputData) return NextResponse.json({ cStatus: 101, msg: `No inputData provided.` }, { status: 400 });

        const postId = params.postId;
        if (!postId) return NextResponse.json({ cStatus: 101, msg: `No postId provided.` }, { status: 400 });

        const postPrisma = await getPostWithRedactedUser(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 430, msg: `Post does not exist.` }, { status: 400 });

        const authTokenCookie = cookies().get('authtoken');
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 402, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        if (userPrisma.id !== postPrisma.seller.id) return NextResponse.json({ cStatus: 430, msg: `This post is not yours.` }, { status: 400 });

        const resValidInput = isValidInputEditPostData(inputData);
        if (!resValidInput.valid) return NextResponse.json({ cStatus: 102, msg: resValidInput.msg }, { status: 400 });
        const postData = editPostDataFromInputs(inputData);

        postPrisma.images.map((image) => deleteFromS3(image)); // Asynchronously delete old images 
        await updatePost(postId, postData);

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}