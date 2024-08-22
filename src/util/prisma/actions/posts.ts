'use server';

import { UserFiltersType } from '@components/pages/shop/Filters';
import { hasBuyerInterestExpired } from '@util/api/posts';
import { MONTH_TO_MILLI, POST_PER_PAGE, POST_PER_PAGE_ACCOUNT } from '@util/global';
import { prisma } from '@util/prisma/client';
import { deleteFromS3, uploadPostPicture } from '@util/s3/aws';



export const getPost = async (postId: string) => {
    const postPrisma = await prisma.post.findFirst({
        where: { id: postId }
    });
    return postPrisma;
}
export const getPostWithPayment = async (postId: string) => {
    const postPrisma = await prisma.post.findFirst({
        where: { id: postId },
        include: { payment: true }
    });
    return postPrisma;
}
export const getPostWithRedactedUser = async (postId: string) => {
    const postPrisma = await prisma.post.findFirst({
        where: { id: postId },
        include: { seller: {
            omit: { password: true, salt: true }
        } }
    });
    return postPrisma;
}


export interface EditPostData {
    title: string,
    description: string,
    category: string,
    size: string,
    gender: string,
    price: number,
    images: File[]
}
export const updatePost = async (postId: string, postData: EditPostData) => {
    const imageUrls: string[] = [];
    for (let i=0; i<postData.images.length; i++) {
        // const imgBytes = await postData.images[i].arrayBuffer();
        // const imgBuffer = Buffer.from(imgBytes);
        // const imgUrl = await uploadPostPicture(imgBuffer, postData.images[i].type);
        // imageUrls.push(imgUrl);
        const imgUrl = await uploadPostPicture(postData.images[i]);
        imageUrls.push(imgUrl);
    }
    const { images, ...cleanedData } = postData;
    const dataWithImages = { ...cleanedData, images: imageUrls };

    const postPrisma = await prisma.post.update({
        where: { id: postId },
        data: dataWithImages
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
    const expiration = new Date(Date.now() + postData.months*MONTH_TO_MILLI);
    const imageUrls: string[] = [];
    for (let i=0; i<postData.images.length; i++) {
        const imgUrl = await uploadPostPicture(postData.images[i]);
        imageUrls.push(imgUrl);
    }
    const { images, userFreeMonths, months, ...cleanedData } = postData;
    const createData = { sellerId: userId, ...cleanedData, images: imageUrls, duration: months, freeMonthsUsed: userFreeMonths, isPaid: false, expireDate: expiration };

    const res = await prisma.post.create({
        data: createData
    });
    return res.id;
}

export const createPaidPost = async (postData: PostData, userId: string) => {
    const expiration = new Date(Date.now() + postData.months*MONTH_TO_MILLI);
    const imageUrls: string[] = [];
    for (let i=0; i<postData.images.length; i++) {
        const imgUrl = await uploadPostPicture(postData.images[i]);
        imageUrls.push(imgUrl);
    }
    const { images, userFreeMonths, months, ...cleanedData } = postData;
    const createData = { sellerId: userId, ...cleanedData, images: imageUrls, duration: months, freeMonthsUsed: userFreeMonths, isPaid: true, expireDate: expiration };

    const res = await prisma.post.create({
        data: createData
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

export const markPostAsDeleted = async (postId: string) => {
    const res = await prisma.post.update({
        where: { id: postId },
        data: { deleted: true }
    });
}








export const getFilteredPosts = async (filters: UserFiltersType, pageNumber: number) => {
    const { categories, sizes, gender, minPrice, maxPrice, deleted } = filters;

    const where: any = {};
    if (categories.length!=0 && categories[0]!='') where.category = { in: categories };
    if (sizes.length!=0  && sizes[0]!='') where.size = { in: sizes };
    if (gender!='Unisex') where.gender = gender;
    where.price = { gte: minPrice, lte: maxPrice };
    where.deleted = deleted;
    where.active = true;

    const posts = await prisma.post.findMany({
        where,
        orderBy: { displayDate: 'desc' },
        skip: POST_PER_PAGE*(pageNumber-1),
        take: POST_PER_PAGE,
    });

    return posts;
}

export const findMaxPages = async (filters: UserFiltersType) => {
    const { categories, sizes, gender, minPrice, maxPrice, deleted } = filters;

    const where: any = {};
    if (categories.length!=0 && categories[0]!='') where.category = { in: categories };
    if (sizes.length!=0  && sizes[0]!='') where.size = { in: sizes };
    if (gender!='Unisex') where.gender = gender;
    where.price = { gte: minPrice, lte: maxPrice };
    where.active = true;
    where.deleted = false;

    const totalPosts = await prisma.post.count({ where });
    return Math.ceil(totalPosts/POST_PER_PAGE);
}



export const getPostsFromUser = async (userId: string, page: number, deleted: boolean) => {
    const posts = await prisma.post.findMany({
        where: { sellerId: userId, deleted: deleted, active: true },
        orderBy: { displayDate: 'desc' },
        skip: POST_PER_PAGE_ACCOUNT*(page-1),
        take: POST_PER_PAGE_ACCOUNT,
    });
    return posts;
}

export const getMaxPagesFromUser = async (userId: string, page: number, deleted: boolean) => {
    const totalPosts = await prisma.post.count({
        where: { sellerId: userId, deleted: deleted, active: true },
        orderBy: { displayDate: 'desc' }
    });
    return Math.ceil(totalPosts/POST_PER_PAGE_ACCOUNT);
}




export const createBuyerInterest = async (buyerId: string, postId: string, msg: string) => {
    const creationRes = await prisma.buyerInterest.create({
        data: { buyerId, postId, msg }
    });
    return creationRes;
}

export const didUserBuyPostRecently = async (buyerId: string, postId: string) => {
    const where = { buyerId, postId };
    const postPrisma = await prisma.buyerInterest.findFirst({ where });
    if (postPrisma==null) return false;
    const hasExpired = hasBuyerInterestExpired(postPrisma);
    return !hasExpired;
}






