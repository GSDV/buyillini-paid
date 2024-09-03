import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth, updateUser } from '@util/prisma/actions/user';
import { ACCEPTED_FILES, IMG_SIZE_LIMIT, PFP_IMG_PREFIX } from '@util/global';
import { cropPfpBuffer, cropPostBuffer, deleteFromS3, getFromS3, getSignedS3Url, uploadToS3 } from '@util/s3/aws';
import { isValidUser } from '@util/api/auth';
import { isValidPhoneNumber } from '@util/api/user';



import { getPost } from '@util/prisma/actions/posts';



// Get a signed AWS S3 URL to use for a profile picture upload
// Settings update form
export async function POST(req: NextRequest) {
    try {
        const { displayName, phoneNumber, fileType, fileSize } = await req.json();
        
        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });

        const userUpdateData: any = {};


        if (!displayName) return NextResponse.json({ cStatus: 101, msg: `Display name is required.` }, { status: 400 });
        userUpdateData.displayName = displayName;
    

        if (phoneNumber != null) {
            const phoneStr = phoneNumber as string;
            if (!isValidPhoneNumber(phoneStr)) return NextResponse.json({ cStatus: 101, msg: `Phone number not valid. Enter 10 numbers.` }, { status: 400 });
            userUpdateData.phoneNumber = phoneStr.replace(/[() "-]/g, '');
        }

        let signedUrl = '';
        let key = '';
        if (fileType != undefined && fileSize != undefined) {
            if (!ACCEPTED_FILES.includes(fileType)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
            if (fileSize > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than 5mb.` }, { status: 400 });

            let resUploadS3: any;

            if (userPrisma.profilePicture!='') {
                const [resS3, resDelete] = await Promise.all([
                    getSignedS3Url(PFP_IMG_PREFIX, fileType),
                    deleteFromS3(userPrisma.profilePicture),
                ]);
                resUploadS3 = resS3;
            } else {
                const resS3 = await getSignedS3Url(PFP_IMG_PREFIX, fileType);
                resUploadS3 = resS3;
            }
            
            userUpdateData.profilePicture = resUploadS3.key;
            signedUrl = resUploadS3.signedUrl;
            key = resUploadS3.key;
        }
        
        
        await updateUser(userPrisma.id, userUpdateData);
        
        // User has uploaded new profile picture
        if (signedUrl!=='') return NextResponse.json({ cStatus: 204, msg: `Success.`, signedUrl: signedUrl, key: key }, { status: 200 });
        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



// Crop the newly uploaded image
// Need server environment for "sharp" library. Consider cropping in client in the future.
export async function PUT(req: NextRequest) {
    try {
        const { operation, key, postId } = await req.json();

        if (!operation || !key) return NextResponse.json({ cStatus: 101, msg: `Missing operation or key.` }, { status: 400 });

        
        const authTokenCookie = cookies().get(`authtoken`);
        if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
        if (!userPrisma) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return NextResponse.json(resValidUser.nextres, { status: 400 });



        const res = await getFromS3(key);
        const arrayBuffer = await res.Body?.transformToByteArray();
        if (!arrayBuffer) return NextResponse.json({ cStatus: 102, msg: `Could not find image.` }, { status: 400 });
        const buffer = Buffer.from(arrayBuffer);
        let croppedBuffer: Buffer;

        if (operation=='CROP_PFP') {
            if (key!=userPrisma.profilePicture) return NextResponse.json({ cStatus: 401, msg: `Not your profile picture.` }, { status: 400 });
            croppedBuffer = await cropPfpBuffer(buffer);
        } else if (operation=='CROP_POST') {
            const postPrisma = await getPost(postId);
            if (!postPrisma || postPrisma.sellerId!=userPrisma.id || postPrisma.deleted || !postPrisma.images.includes(key)) return NextResponse.json({ cStatus: 401, msg: `Not your post.` }, { status: 400 });
            croppedBuffer = await cropPostBuffer(buffer);
        } else {
            return NextResponse.json({ cStatus: 102, msg: `Invalid operation.` }, { status: 400 });
        }

        await uploadToS3(croppedBuffer, key, 'webp');

        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}


