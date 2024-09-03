import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';



export const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRETE_ACCESS_KEY as string
    }
});






export const uploadPostPicture = async (file: File) => {
    const imgBytes = await file.arrayBuffer();
    const imgBuffer = Buffer.from(imgBytes);
    const croppedBuffer = await sharp(imgBuffer).resize({ width: 1200, height: 2100, fit: 'contain' }).flatten({background: { r: 0, g: 0, b: 0 }}).webp({ quality: 80, effort: 6 }).toBuffer();
    const key = `post-f-${uuidv4()}`;
    await uploadToS3(croppedBuffer, key, 'webp');
    return key;
}

export const uploadPfpPicture = async (file: File) => {
    const imgBytes = await file.arrayBuffer();
    const imgBuffer = Buffer.from(imgBytes);
    const croppedBuffer = await sharp(imgBuffer).resize({ width: 250, height: 250, fit: 'cover' }).flatten({background: { r: 0, g: 0, b: 0 }}).webp({ quality: 80, effort: 6 }).toBuffer();
    const key = `post-f-${uuidv4()}`;
    await uploadToS3(croppedBuffer, key, 'webp');
    return key;
}



export const cropPostBuffer = async (buffer: Buffer) => {
    const croppedBuffer = await sharp(buffer).resize({ width: 1200, height: 2100, fit: 'contain' }).flatten({background: { r: 0, g: 0, b: 0 }}).webp({ quality: 80, effort: 6 }).toBuffer();
    return croppedBuffer;
}

export const cropPfpBuffer = async (buffer: Buffer) => {
    const croppedBuffer = await sharp(buffer).resize({ width: 250, height: 250, fit: 'cover' }).flatten({background: { r: 0, g: 0, b: 0 }}).webp({ quality: 80, effort: 6 }).toBuffer();
    return croppedBuffer;
}



export const uploadToS3 = async (buffer: Buffer, key: string, type: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: type
    }
    const cmd = new PutObjectCommand(params);
    const res = await s3Client.send(cmd);
}

export const getFromS3 = async (key: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }
    const cmd = new GetObjectCommand(params);
    const res = await s3Client.send(cmd);
    return res;
}



export const deleteFromS3 = async (key: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }
    const cmd = new DeleteObjectCommand(params);
    const res = await s3Client.send(cmd);
}



export const getSignedS3Url = async (prefix: string, type: string) => {
    const key = prefix + uuidv4();

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: type
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return {signedUrl, key};
}
