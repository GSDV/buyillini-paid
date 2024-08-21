import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';



export const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRETE_ACCESS_KEY as string
    }
});



export const uploadPostPicture = async (file: File) => {
    try {
        console.log("-> AAA")
        const imgBytes = await file.arrayBuffer();
        console.log("-> BBB")
        const imgBuffer = Buffer.from(imgBytes);
        console.log("-> CCC")
        const metadata = await sharp(imgBuffer).metadata();
        console.log("metadata: ", metadata);
        // const croppedBuffer = await sharp(imgBuffer).resize({ width: 1200, height: 2100, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).webp({ quality: 80, effort: 6 }).toBuffer();
        const croppedBuffer = await sharp(imgBuffer).resize({ width: 1200, height: 2100, fit: 'contain' }).flatten({background: { r: 0, g: 0, b: 0 }}).webp({ quality: 80, effort: 6 }).toBuffer();
        
        console.log("-> DDD")
        const key = `post-f-${uuidv4()}`;
        console.log("UPLOADING TO S3 with type: ", file.type);
        await uploadToS3(croppedBuffer, key, file.type);
        // console.log("RES: ", res);
        console.log("UPLOADING TO S3 finish");
        return key;
    } catch (err) {
        console.log("uPP: error ", err);
        return err as string;
    }
}

// export const uploadPostPicture = async (buffer: Buffer, type: string) => {
//     const croppedBuffer = await sharp(buffer).resize({ width: 1200, height: 2100, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).webp({ quality: 80, effort: 6 }).toBuffer();
//     const key = `post-f-${uuidv4()}`;
//     const res = await uploadToS3(croppedBuffer, key, type);
//     return key;
// }


export const uploadPfp = async (buffer: Buffer, type: string) => {
    const croppedBuffer = await sharp(buffer).resize({ width: 250, height: 250, fit: 'cover' }).toBuffer();
    const key = `pfp-f-${uuidv4()}`;
    const res = await uploadToS3(croppedBuffer, key, type);
    return key;
}


export const uploadToS3 = async (file: Buffer, key: string, type: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: type
    }
    const cmd = new PutObjectCommand(params);

    try {
        const res = await s3Client.send(cmd);
        console.log("RES: ", res)
    } catch (err) {
        console.log("S3 ERROR: ", err);
    }
    // return res;
}


export const deleteFromS3 = async (key: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }
    const cmd = new DeleteObjectCommand(params);
    await s3Client.send(cmd);
}