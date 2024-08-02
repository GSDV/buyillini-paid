'use server';

import { MONTH_TO_MILLI } from '@util/global';
import { prisma } from '@util/prisma/client';
import { deleteFromS3, uploadPostPicture } from '@util/s3/aws';



export const getPost = async (postId: string) => {
    const postPrisma = await prisma.post.findFirst({
        where: { id: postId }
    });
    return postPrisma;
}



export const markPostActive = async (postId: string) => {
    const postPrisma = await prisma.post.update({
        where: { id: postId },
        data: { active: true }
    });
    return postPrisma;
}



export interface PostData {
    title: string,
    description: string,
    category: string,
    size: string,
    gender: string,
    price: number,
    images: File[],
    months: number,
    userFreeMonths: number
}
export const createFreePost = async (postData: PostData, userId: string) => {
    const { title, description, category, size, gender, price, images, months, userFreeMonths } = postData;
    const expiration = new Date(Date.now() + months*MONTH_TO_MILLI);
    const imgUrls: string[] = [];
    for (let i=0; i<images.length; i++) {
        const imgBytes = await images[i].arrayBuffer();
        const imgBuffer = Buffer.from(imgBytes);
        const imgUrl = await uploadPostPicture(imgBuffer);
        imgUrls.push(imgUrl);
    }

    const res = await prisma.post.create({
        data: {
            sellerId: userId,
            title: title,
            description: description,
            category: category,
            size: size,
            gender: gender,
            price: price,
            images: imgUrls,
            duration: months,
            freeMonthsUsed: userFreeMonths,
            isPaid: false,
            expireDate: expiration
        }
    });

    return res.id;
}

export const createPaidPost = async (postData: PostData, userId: string) => {
    const { title, description, category, size, gender, price, images, months, userFreeMonths } = postData;
    const expiration = new Date(Date.now() + months*MONTH_TO_MILLI);
    const imgUrls: string[] = [];
    for (let i=0; i<images.length; i++) {
        const imgBytes = await images[i].arrayBuffer();
        const imgBuffer = Buffer.from(imgBytes);
        const imgUrl = await uploadPostPicture(imgBuffer);
        imgUrls.push(imgUrl);
    }

    const res = await prisma.post.create({
        data: {
            sellerId: userId,
            title: title,
            description: description,
            category: category,
            size: size,
            gender: gender,
            price: price,
            images: imgUrls,
            duration: months,
            freeMonthsUsed: userFreeMonths,
            isPaid: true,
            expireDate: expiration
        }
    });

    return res.id;
}



export const getDraftedPost = async (id: string) => {
    const postPrisma = await prisma.post.findFirst({
        where: { sellerId: id, active: false }
    });
    return postPrisma;
}

export const deleteDraftedPosts = async (id: string) => {
    const posts = await prisma.post.findMany({
        where: { sellerId: id, active: false }
    });
    for (let i=0; i<posts.length; i++) await deletePost(posts[i].id);
}



export const deletePost = async (postId: string) => {
    const postPrisma = await prisma.post.delete({
        where: { id: postId }
    });
    if (!postPrisma) return null;
    for (let i=0; i<postPrisma.images.length; i++) await deleteFromS3(postPrisma.images[i]);
    return postPrisma;
}