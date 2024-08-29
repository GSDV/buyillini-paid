'use server';

import { UserFiltersType } from '@components/pages/shop/Filters';
import { hasBuyerInterestExpired } from '@util/api/posts';
import { CATEGORIES, CLOTHING_SIZES, GENDERS, MONTH_TO_MILLI, POST_PER_PAGE, POST_PER_PAGE_ACCOUNT } from '@util/global';
import { prisma } from '@util/prisma/client';
import { deleteFromS3 } from '@util/s3/aws';



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
    images: string[]
}
export const updatePost = async (postId: string, postData: EditPostData) => {
    const postPrisma = await prisma.post.update({
        where: { id: postId },
        data: postData
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
    images: string[],
    duration: number,
    freeMonthsUsed: number
}
export const createFreePost = async (postData: PostData, userId: string) => {
    const expiration = new Date(Date.now() + postData.duration*MONTH_TO_MILLI);
    const createData = { sellerId: userId, ...postData, isPaid: false, expireDate: expiration };
    const res = await prisma.post.create({
        data: createData
    });
    return res.id;
}

export const createPaidPost = async (postData: PostData, userId: string) => {
    const expiration = new Date(Date.now() + postData.duration*MONTH_TO_MILLI);
    const createData = { sellerId: userId, ...postData, isPaid: true, expireDate: expiration };
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

export const createDraftedPost = async (id: string) => {
    const postPrisma = await prisma.post.create({
        data: {
            sellerId: id,
            title: '',
            description: '',
            category: CATEGORIES[0].link,
            size: CLOTHING_SIZES[0],
            gender: GENDERS[0],
            price: 0,
            images: [],
            duration: 1,
            isPaid: true,
            freeMonthsUsed: 0,
            expireDate: new Date(Date.now() + MONTH_TO_MILLI),
        }
    });
    return postPrisma;
}

export const deleteDraftedPosts = async (id: string) => {
    const postsToDelete = await prisma.post.findMany({
        where: { sellerId: id, active: false }
    });

    postsToDelete.map((post) => {
        post.images.map((image) => {
            deleteFromS3(image); // Asynchronous process
        });
    });
    
    await prisma.post.deleteMany({
        where: { sellerId: id, active: false }
    });
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





export const updatePostImagesArr = async (postId: string, images: string[]) => {
    await prisma.post.update({
        where: { id: postId }, 
        data: { images: images }
    });
}

export const addImageKeyToPost = async (postId: string, imgKey: string) => {
    await prisma.post.update({
        where: { id: postId }, 
        data: { images: { push: imgKey } }
    });
}




export const markDeletePost = async (postId: string) => {
    const res = await prisma.post.update({
        where: { id: postId },
        data: { deleted: true }
    });
}
