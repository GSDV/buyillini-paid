// Admin actions
'use server';

import { prisma } from '@util/prisma/client';
import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { RedactedUser } from '@util/prisma/types';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { CATEGORIES, CLOTHING_SIZES, GENDERS, MONTH_TO_MILLI, isRegCat } from '@util/global';
import { deleteFromS3 } from '@util/s3/aws';



export const isAdmin = async (authTokenCookie: RequestCookie | undefined) => {
    if (!authTokenCookie) return false;
    const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
    return isUserAdmin(userPrisma);
}

export const isUserAdmin = (user: RedactedUser | null) => {
    return (user!=null && !user.banned && !user.deleted && user.active && user.role==='ADMIN');
}





/*********
 * USERS *
 *********/

export const getUser = async (where: any) => {
    return (await prisma.user.findFirst({ where }));
}

export const updateUser = async (where: any, data: any) => {
    await prisma.user.update({ where, data });
}


// Mark a user as deleted, and mark all of his posts as deleted too
export const markDeleteUser = async (where: any) => {
    const res = await prisma.user.update({
        where,
        data: {
            deleted: true,
            posts: {
                updateMany: {
                    where: { deleted: false, active: true },
                    data: { deleted: true }
                }
            }
        }
    });
}


export const deleteUser = async (where: any) => {
    const res = await prisma.user.delete({ where });
}


export const banUser = async (where: any, msg: string, expiration: Date | null) => {
    const res = await prisma.user.update({
        where,
        data: {
            banned: true,
            banMsg: msg,
            banExpiration: expiration,
            posts: {
                updateMany: {
                    where: { deleted: false, active: true },
                    data: { deleted: true }
                }
            }
        }
    });
}





/*********
 * POSTS *
 *********/

export interface SuperPostData {
    title: string,
    description: string,
    category: string,
    size: string,
    gender: string,
    price: number,
    images: string[],
    duration: number,
}



export interface InputSuperPostData {
    title: string,
    description: string,
    category: string,
    size: string,
    gender: string,
    price: string,
    images: string[],
    duration: string
}
export const isValidInputSuperPostData = (inputData: any) => {
    const { title, description, category, size, gender, price, images, duration } = inputData;

    const msg = function() {
        if (!title) return `Missing title.`;
        if (!description) return `Missing description.`;
        if (!category) return `Missing category.`;
        if (isRegCat(category) && !size) return `Missing size.`;
        if (!gender) return `Missing gender.`;
        if (!price) return `Missing price.`;
        if (!images) return `Missing images.`;
        if (!duration) return `Missing listing duration.`;

        if (typeof title != 'string' || typeof description != 'string' || typeof category != 'string' || typeof size != 'string' || typeof gender != 'string' || typeof price != 'string' || typeof images != 'object' || typeof duration != 'string') {
            return `Something went wrong (incorrect input field types).`;
        }

        if (title.length>50) return `Title must be less than 50 characters.`;
        if (description.length>300) return `Description must be less than 300 characters.`;

        if (!CATEGORIES.some(c => c.link===category)) return `Specify category.`;
        if (isRegCat(category) && !CLOTHING_SIZES.includes(size)) return `Specify clothing size.`;
        if (!GENDERS.includes(gender)) return `Specify gender.`;

        if (Number(price)<0 || Number(price)>9999.99) return `Price must be between $0 and $9,999.99.`;

        if (images.length<=0 || images.length>5) return `Must provide 1 to 5 images.`;

        if (Number(duration)<=0) return `Listing period must be above 0.`;
    
        return ``;
    }();

    return { valid: (msg===``), msg: msg };
}
export const superPostDataFromInputs = (data: InputSuperPostData) => {
    const { price, duration, ...overlapData } = data;
    const postData: SuperPostData = {
        ...overlapData,
        price: Number(price),
        duration: Number(duration),
    }
    return postData;
}



export const createSuperPost = async (postData: SuperPostData, adminId: string) => {
    const expiration = new Date(Date.now() + postData.duration*MONTH_TO_MILLI);
    const { ...cleanedData } = postData;
    const createData = { sellerId: adminId, ...cleanedData, freeMonthsUsed: 0, isPaid: false, expireDate: expiration, active: true };

    const postPrisma = await prisma.post.create({
        data: createData
    });
    return postPrisma.id;
}




export const deletePost = async (postId: string) => {
    const postPrisma = await prisma.post.delete({
        where: { id: postId }
    });
    if (!postPrisma) return null;
    for (let i=0; i<postPrisma.images.length; i++) deleteFromS3(postPrisma.images[i]); // Asynchronous process
    return postPrisma;
}






/*********
 * PROMO *
 *********/

export const makePromoCode = async (code: string, eligibleUsers: string[], freeMonths: number) => {
    await prisma.promoCode.create({
        data: {
            code: code.toUpperCase(),
            eligibleUsers,
            freeMonths
        }
    });
}



export const deletePromoCode = async (code: string) => {
    await prisma.promoCode.delete({
        where: { code: code.toUpperCase() }
    });
}