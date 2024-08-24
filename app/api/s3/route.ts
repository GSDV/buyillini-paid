import { NextRequest, NextResponse } from 'next/server';

import { ACCEPTED_FILES, IMG_SIZE_LIMIT, PFP_IMG_PREFIX, POST_IMG_PREFIX } from '@util/global';
import { getSignedS3Url } from '@util/s3/aws';



// Get a signed S3 upload URL so thta user can upload a photo on the client (bypass 4.5mb limit).
// Part of post creation process and pfp upload process.
export async function POST(req: NextRequest) {
    try {
        const { operation, fileType, fileSize } = await req.json();
        if (!operation || !fileType || !fileSize) return NextResponse.json({ cStatus: 101, msg: `Some fields missing.` }, { status: 400 });


        if (!ACCEPTED_FILES.includes(fileType)) return NextResponse.json({ cStatus: 102, msg: `Upload only png, jpg, or webp images.` }, { status: 400 });
        if (fileSize > IMG_SIZE_LIMIT) return NextResponse.json({ cStatus: 102, msg: `Upload images less than 10mb.` }, { status: 400 });

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