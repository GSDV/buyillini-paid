import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth, getValidRedactedUserFromAuth, updateUser } from '@util/prisma/actions/user';
import { ACCEPTED_FILES, IMG_ACCEPTED_FILES, IMG_SIZE_LIMIT, POST_IMG_PREFIX } from '@util/global';
import { delayDeleteFromS3, deleteFromS3, getSignedS3Url, uploadPfpPicture, uploadPostPicture, uploadToS3 } from '@util/s3/aws';
import { addImageKeyToPost, getPost, updatePost, updatePostImagesArr } from '@util/prisma/actions/posts';




export async function POST(req: NextRequest) {
    try {
        const { fileType, fileSize } = await req.json();
        if (!fileType || !fileSize) return NextResponse.json({ cStatus: 101, msg: `Some fields missing.` }, { status: 400 });

        if (!ACCEPTED_FILES.includes(fileType)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
        if (fileSize > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than 10mb.` }, { status: 400 });

        const {signedUrl, key} = await getSignedS3Url(POST_IMG_PREFIX, 'webp');
        
        return NextResponse.json({ cStatus: 200, msg: `Success.`, key, signedUrl }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}





export async function PUT(req: NextRequest) {
    try {
        const { postId, key } = await req.json();

        if (!postId || !key) return NextResponse.json({ cStatus: 101, msg: `Some fields missing.` }, { status: 400 });

        const authTokenCookie = cookies().get(`authtoken`);

        const [resUser, postPrisma] = await Promise.all([
            getValidRedactedUserFromAuth(authTokenCookie?.value),
            getPost(postId)
        ]);

        const userPrisma = resUser.user;
        if (!resUser.valid || userPrisma==null || postPrisma==null || postPrisma.sellerId!=userPrisma.id || postPrisma.deleted || postPrisma.images.length>=5) {
            delayDeleteFromS3(key);
            return NextResponse.json({ cStatus: 999, msg: `Something went wrong.` }, { status: 400 }); 
        }

        await addImageKeyToPost((postPrisma as any).id, key);

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
      
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}


