import { NextRequest, NextResponse } from 'next/server';

import { ACCEPTED_FILES, IMG_SIZE_LIMIT, IMG_SIZE_LIMIT_TXT, PFP_IMG_PREFIX, POST_IMG_PREFIX } from '@util/global';
import { deleteFromS3, getSignedS3Url } from '@util/s3/aws';
import { cookies } from 'next/headers';
import { getPost, updatePostImagesArr } from '@util/prisma/actions/posts';
import { getRedactedUserFromAuth, updateUser } from '@util/prisma/actions/user';
import { isValidUser } from '@util/api/auth';



// Get a signed AWS S3 upload URL so thta user can upload a photo on the client (bypass 4.5mb limit).
// Part of post creation process and pfp upload process.
export async function POST(req: NextRequest) {
    try {
        const { operation, fileType, fileSize } = await req.json();
        if (!operation || !fileType || !fileSize) return NextResponse.json({ cStatus: 101, msg: `Some fields missing.` }, { status: 400 });

        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });


        if (!ACCEPTED_FILES.includes(fileType)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
        if (fileSize > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than ${IMG_SIZE_LIMIT_TXT}.` }, { status: 400 });

        let prefix: string;
        if (operation=='UPLOAD_POST_PHOTO') prefix = POST_IMG_PREFIX;
        else if (operation=='UPLOAD_PFP_PHOTO') prefix = PFP_IMG_PREFIX;
        else return NextResponse.json({ cStatus: 999, msg: `Invalid operation.` }, { status: 400 });

        const {signedUrl, key} = await getSignedS3Url(prefix, 'webp');
        
        return NextResponse.json({ cStatus: 200, msg: `Success.`, key, signedUrl }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}





// Delete an image from a post
export async function DELETE(req: NextRequest) {
    try {
        const { operation, postId, imageKeys } = await req.json();
        if (!operation || !postId) return NextResponse.json({ cStatus: 102, msg: `Missing data.` }, { status: 400 });

        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 999, msg: `You are not logged in.` }, { status: 400 });


        if (operation=='DELETE_POST_PHOTO') {
            if (!imageKeys || typeof imageKeys == 'object') return NextResponse.json({ cStatus: 102, msg: `Missing imageKeys.` }, { status: 400 });

            const [userPrisma, postPrisma] = await Promise.all([
                getRedactedUserFromAuth(authTokenCookie.value),
                getPost(postId),
            ]);

            if (!userPrisma) return NextResponse.json({ cStatus: 999, msg: `You are not logged in.` }, { status: 400 });
            if (!postPrisma) return NextResponse.json({ cStatus: 999, msg: `Post does not exist.` }, { status: 400 });
            if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 999, msg: `This is not your post.` }, { status: 400 });
            const postImages = postPrisma.images;

            const keyDoesNotExist = imageKeys.some((key: string) => !postImages.includes(key));
            if (keyDoesNotExist) return NextResponse.json({ cStatus: 999, msg: `Image does not exist on post.` }, { status: 400 });

            const newImages = postImages.filter(img => !imageKeys.incldues(img));

            imageKeys.map((key: string) => {
                deleteFromS3(key) // Asynchronous processes
            });
            await updatePostImagesArr(postId, newImages);
        } else if (operation=='DELETE_PFP_PHOTO') {
            // Put all this code in a different function, one that is for replacing a profile picture.
            // You can combine the update({ pfp: "" }) and update({ pfp: newpfp })
            const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);

            if (!userPrisma) return NextResponse.json({ cStatus: 999, msg: `You are not logged in.` }, { status: 400 });
            if (userPrisma.profilePicture=='') return NextResponse.json({ cStatus: 201, msg: `Success (Did not have profile picture).` }, { status: 200 });

            deleteFromS3(userPrisma.profilePicture) // Asynchronous processes
            await updateUser(userPrisma.id, { profilePicture: '' });
        } else {
            return NextResponse.json({ cStatus: 102, msg: `Invalid operation.` }, { status: 400 });
        }

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}