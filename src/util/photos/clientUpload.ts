// Only to be used in client components.
// Useful for bypassing Vercel upload limit by uploading to S3 on client, not server.
'use client';

import { makePostPicture } from "./crop";



export const clientUploadImagesAndGetKeys = async (images: File[]) => {
    const keyPromises = images.map((image) => clientUploadImage(image));
    const imageKeys = await Promise.all(keyPromises);

    if (imageKeys.includes(null)) return null;
    return imageKeys;
}



export const clientUploadImage = async (image: File) => {
    const [resSignAndKey, croppedPostBlob] = await Promise.all([
        fetch(`/api/s3`, {
            method: 'POST',
            body: JSON.stringify({ operation: 'UPLOAD_POST_PHOTO', fileType: image.type, fileSize: image.size }),
            headers: { 'Content-Type': 'application/json' }
        }),
        makePostPicture(image)
    ]);

    if (croppedPostBlob == null) return null;
    const resSignAndKeyJson = await resSignAndKey.json();
    if (resSignAndKeyJson.cStatus!=200) return null;

    await fetch(resSignAndKeyJson.signedUrl, {
        method: 'PUT',
        body: croppedPostBlob,
        headers: { 'Content-Type': 'webp' }
    });
    return resSignAndKeyJson.key;
}