import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { ACCEPTED_FILES, IMG_ACCEPTED_FILES, IMG_SIZE_LIMIT, POST_IMG_PREFIX } from '@util/global';
import { deleteFromS3, getSignedS3Url } from '@util/s3/aws';
import { addImageKeyToPost, getPost, updatePost, updatePostImagesArr } from '@util/prisma/actions/posts';



// Get redacted user prisma from auth token cookie
export async function GET(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 210, msg: `Success (not logged in).`, user: null }, { status: 200 });

        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 210, msg: `Success (not logged in).`, user: null }, { status: 200 });

        return NextResponse.json({ cStatus: 200, msg: `Success.`, user: userPrisma }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Get a signed AWS S3 URL to use for an image
export async function POST(req: NextRequest) {
    try {
        const { postId, fileType, fileSize } = await req.json();
        
        if (!ACCEPTED_FILES.includes(fileType)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
        if (fileSize > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than 5mb.` }, { status: 400 });

        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        
        const postPrisma = await getPost(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 400, msg: `Post does not exist.` }, { status: 400 });
        console.log()
        if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 400, msg: `Not your post.` }, { status: 400 });
        if (postPrisma.images.length >= 5) return NextResponse.json({ cStatus: 400, msg: `Post must have between 1 and 5 photos.` }, { status: 400 });

        const {signedUrl, key} = await getSignedS3Url(POST_IMG_PREFIX, fileType);
        await addImageKeyToPost(postId, key);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, signedUrl: signedUrl, key: key }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Delete an image from a post
export async function DELETE(req: NextRequest) {
    try {
        const { postId, deletedImgKey } = await req.json();

        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });

        const postPrisma = await getPost(postId);
        if (!postPrisma) return NextResponse.json({ cStatus: 400, msg: `Post does not exist.` }, { status: 400 });
        if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 400, msg: `Not your post.` }, { status: 400 });
        if (!postPrisma.images.includes(deletedImgKey)) return NextResponse.json({ cStatus: 400, msg: `Image does not exist on post.`, deletedImgKey, images: postPrisma.images }, { status: 400 });

        const newImages = postPrisma.images.filter(img => img !== deletedImgKey);

        const [resS3, resPrisma] = await Promise.all([
            deleteFromS3(deletedImgKey),
            updatePostImagesArr(postId, newImages)
        ]);

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}


