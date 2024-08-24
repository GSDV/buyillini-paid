import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getRedactedUserFromAuth, getValidRedactedUserFromAuth, updateUser } from '@util/prisma/actions/user';
import { ACCEPTED_FILES, IMG_ACCEPTED_FILES, IMG_SIZE_LIMIT, POST_IMG_PREFIX } from '@util/global';
import { deleteFromS3, getSignedS3Url, uploadPfpPicture, uploadPostPicture, uploadToS3 } from '@util/s3/aws';
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
// export async function POST(req: NextRequest) {
//     try {
//         const { postId, fileType, fileSize } = await req.json();
        
//         if (!ACCEPTED_FILES.includes(fileType)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
//         if (fileSize > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than 5mb.` }, { status: 400 });

//         const authTokenCookie = cookies().get(`authtoken`);
//         if (!authTokenCookie) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
//         const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
//         if (!userPrisma) return NextResponse.json({ cStatus: 401, msg: `You are not logged in.` }, { status: 400 });
        
//         const postPrisma = await getPost(postId);
//         if (!postPrisma) return NextResponse.json({ cStatus: 400, msg: `Post does not exist.` }, { status: 400 });
//         if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 400, msg: `Not your post.` }, { status: 400 });
//         if (postPrisma.images.length >= 5) return NextResponse.json({ cStatus: 400, msg: `Post must have between 1 and 5 photos.` }, { status: 400 });

//         const {signedUrl, key} = await getSignedS3Url(POST_IMG_PREFIX, fileType);
//         await addImageKeyToPost(postId, key);

//         return NextResponse.json({ cStatus: 200, msg: `Success.`, signedUrl: signedUrl, key: key }, { status: 200 });
//     } catch (err) {
//         return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
//     }
// }




// export async function POST(req: NextRequest) {
//     try {
//         const data = await req.formData();

//         if (!data) return NextResponse.json({ cStatus: 101, msg: `No data provided. Refresh this page.` }, { status: 400 });

//         const operation = data.get('operation') as string;
//         const image = data.get('image') as File;
//         const postId = data.get('postId') as string;

//         if (!operation || !image) return NextResponse.json({ cStatus: 102, msg: `Missing fields.` }, { status: 400 });

//         if (!ACCEPTED_FILES.includes(image.type)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
//         if (image.size > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than 4.5mb.` }, { status: 400 });


//         const authTokenCookie = cookies().get(`authtoken`);


//         if (operation=='UPLOAD_POST') {
//             const [resUser, postPrisma, s3Key] = await Promise.all([
//                 getValidRedactedUserFromAuth(authTokenCookie?.value),
//                 getPost(postId),
//                 uploadPostPicture(image)
//             ]);
//             const userPrisma = resUser.user;

//             let nextRes: any = null;
//             if (!resUser.valid || userPrisma==null)         nextRes = resUser.nextRes;
//             else if (postPrisma==null)                      nextRes = {cStatus: 999, msg: `Post does not exist.`};
//             else if (postPrisma.sellerId!=userPrisma.id)    nextRes = {cStatus: 999, msg: `Not your post.`};
//             else if (postPrisma.deleted)                    nextRes = {cStatus: 999, msg: `This post has been deleted.`};
//             else if (postPrisma.images.length>=5)           nextRes = {cStatus: 999, msg: `Post can have up to 5 images.`};
//             if (nextRes!=null) {
//                 deleteFromS3(s3Key); // Asynchronous call
//                 return NextResponse.json(nextRes, { status: 400 });
//             }

//             await addImageKeyToPost((postPrisma as any).id, s3Key);
//             return NextResponse.json({ cStatus: 200, msg: `Success.`, key: s3Key }, { status: 200 });
//         }
//         else if (operation=='UPLOAD_PFP') {
//             const [resUser, s3Key] = await Promise.all([
//                 getValidRedactedUserFromAuth(authTokenCookie?.value),
//                 uploadPfpPicture(image)
//             ]);
//             const userPrisma = resUser.user;

//             let nextRes: any = null;
//             if (!resUser.valid || userPrisma==null)         nextRes = resUser.nextRes;
//             if (nextRes!=null) {
//                 deleteFromS3(s3Key); // Asynchronous call
//                 return NextResponse.json(nextRes, { status: 400 });
//             }

//             if (userPrisma!=null && userPrisma.profilePicture!=='') deleteFromS3(userPrisma.profilePicture); // Asynchronous call
//             await updateUser((userPrisma as any).id, { profilePicture: s3Key });
//             return NextResponse.json({ cStatus: 200, msg: `Success.`, key: s3Key }, { status: 200 });
//         }
//     } catch (err) {
//         return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
//     }
// }



export async function POeST(req: NextRequest) {
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
        if (postPrisma.sellerId != userPrisma.id) return NextResponse.json({ cStatus: 400, msg: `Not your post.` }, { status: 400 });
        if (postPrisma.images.length >= 5) return NextResponse.json({ cStatus: 400, msg: `Post must have between 1 and 5 photos.` }, { status: 400 });

        const {signedUrl, key} = await getSignedS3Url(POST_IMG_PREFIX, fileType);
        await addImageKeyToPost(postId, key);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, signedUrl: signedUrl, key: key }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}



export async function POST(req: NextRequest) {
    try {
        const { operation, postId, fileType, fileSize } = await req.json();

        if (!operation || !postId || !fileType || !fileSize) return NextResponse.json({ cStatus: 101, msg: `Some fields missing.` }, { status: 400 });

        if (!ACCEPTED_FILES.includes(fileType)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
        if (fileSize > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than 10mb.` }, { status: 400 });

        const authTokenCookie = cookies().get(`authtoken`);

        if (operation=='UPLOAD_POST') {
            const {signedUrl, key} = await getSignedS3Url(POST_IMG_PREFIX, 'webp');

            Promise.all([
                getValidRedactedUserFromAuth(authTokenCookie?.value),
                getPost(postId)
            ])
            .then(([resUser, postPrisma]) => {
                const userPrisma = resUser.user;
                if (!resUser.valid || 
                    userPrisma==null || 
                    postPrisma==null || 
                    postPrisma.sellerId!=userPrisma.id || 
                    postPrisma.deleted || 
                    postPrisma.images.length>=5) return; // maybe delete here? maybe wait for a few seconds and then delete?
                addImageKeyToPost((postPrisma as any).id, key);
            });

            return NextResponse.json({ cStatus: 200, msg: `Success.`, key, signedUrl }, { status: 200 });
        }
        else if (operation=='UPLOAD_PFP') {
        }
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}







// Delete an image from a post
export async function DELETE(req: NextRequest) {
    try {
        const { postId, deletedImgKey } = await req.json();
        if (!postId || !deletedImgKey) return NextResponse.json({ cStatus: 102, msg: `Missing data.` }, { status: 400 });

        const authTokenCookie = cookies().get(`authtoken`);

        const [resUser, postPrisma] = await Promise.all([
            getValidRedactedUserFromAuth(authTokenCookie?.value),
            getPost(postId),
        ]);

        const userPrisma = resUser.user;

        let nextRes: any = null;
        if (!resUser.valid || userPrisma==null)         nextRes = resUser.nextRes;
        else if (postPrisma==null)                      nextRes = {cStatus: 999, msg: `Post does not exist.`};
        else if (postPrisma.sellerId!=userPrisma.id)    nextRes = {cStatus: 999, msg: `Not your post.`};
        else if (postPrisma.deleted)                    nextRes = {cStatus: 999, msg: `This post has been deleted.`};
        else if (!postPrisma.images.includes(deletedImgKey)) nextRes = {cStatus: 999, msg: `Image does not exist on post.`};
        if (nextRes!=null) return NextResponse.json(nextRes, { status: 400 });

        const newImages = (postPrisma as any).images.filter((img: any) => img !== deletedImgKey);
        await updatePostImagesArr(postId, newImages);
        deleteFromS3(deletedImgKey); // Asynchronous call
        return NextResponse.json({ cStatus: 200, msg: `Success.` }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}


