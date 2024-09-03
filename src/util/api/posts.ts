import { BuyerInterest, Post } from '@prisma/client';
import { BUYER_INTEREST_EXPIRATION, CATEGORIES, CLOTHING_SIZES, GENDERS, NO_SIZE_GENDER_CATEGORIES, isRegCat } from '@util/global';
import { EditPostData, PostData } from '@util/prisma/actions/posts';



export const isPostValid = (post: Post | null) => {
    if (!post) return { valid: false, nextres: { cStatus: 430, msg: `Post does not exist.` } };
    if (!post.active) return { valid: false, nextres: { cStatus: 432, msg: `This post is not active` } };
    const currentDate = new Date();
    if (currentDate > post.expireDate) return { valid: false, nextres: { cStatus: 434, msg: `This post has expired.` } };
    if (post.deleted) return { valid: false, nextres: { cStatus: 433, msg: `This post has been deleted.` } };
    return { valid: true };
}



export interface InputPostData {
    title: string,
    description: string,
    category: string,
    size: string,
    gender: string,
    price: string,
    images: string[],
    duration: string,
    freeMonthsUsed: string
}
export const isValidInputPostData = (inputData: any) => {
    const { title, description, category, size, gender, price, images, duration, freeMonthsUsed } = inputData;

    const msg = function() {
        if (!title) return `Missing title.`;
        if (!description) return `Missing description.`;
        if (!category) return `Missing category.`;
        if (isRegCat(category) && !size) return `Missing size.`;
        if (!gender) return `Missing gender.`;
        if (!price) return `Missing price.`;
        if (!images) return `Missing images.`;
        if (!duration) return `Missing listing duration.`;
        if (!freeMonthsUsed) return `Missing free months used.`;

        if (typeof title != 'string' || typeof description != 'string' || typeof category != 'string' || typeof size != 'string' || typeof gender != 'string' || typeof price != 'string' || typeof images != 'object' || typeof duration != 'string' || typeof freeMonthsUsed != 'string') {
            return `Something went wrong (incorrect input field types).`;
        }

        if (title.length>50) return `Title must be less than 50 characters.`;
        if (description.length>300) return `Description must be less than 300 characters.`;

        if (!CATEGORIES.some(c => c.link===category)) return `Specify category.`;
        if (isRegCat(category) && !CLOTHING_SIZES.includes(size)) return `Specify clothing size.`;
        if (!GENDERS.includes(gender)) return `Specify gender.`;

        if (Number(price)<0 || Number(price)>9999.99) return `Price must be between $0 and $9,999.99.`;

        if (images.length<=0 || images.length>5) return `Must provide 1 to 5 images.`;

        if (Number(duration)<=0 || Number(duration)>10) return `Listing period must be between 1 and 10.`;
        if (Number(freeMonthsUsed)<0 || Number(freeMonthsUsed)>10) return `Free months used must be between 0 and 10.`;
        if (freeMonthsUsed > duration) return `You specified more free months than listing duration.`;
    
        return ``;
    }();

    return { valid: (msg===``), msg: msg };
}
export const createPostDataFromInputs = (data: InputPostData) => {
    const { price, duration, freeMonthsUsed, ...overlapData } = data;
    const postData: PostData = {
        ...overlapData,
        price: Number(price),
        duration: Number(duration),
        freeMonthsUsed: Number(freeMonthsUsed)
    }
    return postData;
}






export const getEditPostData = (formData: FormData) => {
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const size = formData.get('size');
    const gender = formData.get('gender');
    const price = formData.get('price');
    const images = formData.getAll('images') as File[];

    if (!title || !description || !category || !size || !gender || !price || !images) return null;

    const postData: EditPostData = {
        title: title as string,
        description: description as string,
        category: category as string,
        size: size as any,
        gender: gender as string,
        price: Math.round(Number(price)*100)/100,
        images: formData.getAll('images') as string[]
    }
    return postData;
}






/* * * * * * *
 * EDIT POST *
 * * * * * * */
export interface InputEditPostData {
    title: string,
    description: string,
    category: string,
    size: string,
    gender: string,
    price: string,
    images: string[]
}
export const isValidInputEditPostData = (inputData: any) => {
    const { title, description, category, size, gender, price, images } = inputData;

    const msg = function() {
        if (!title) return `Missing title.`;
        if (!description) return `Missing description.`;
        if (!category) return `Missing category.`;
        if (isRegCat(category) && !size) return `Missing size.`;
        if (!gender) return `Missing gender.`;
        if (!price) return `Missing price.`;
        if (!images) return `Missing images.`;

        if (typeof title != 'string' || typeof description != 'string' || typeof category != 'string' || typeof size != 'string' || typeof gender != 'string' || typeof price != 'string' || typeof images != 'object') {
            return `Something went wrong (incorrect input field types).`;
        }

        if (title.length>50) return `Title must be less than 50 characters.`;
        if (description.length>300) return `Description must be less than 300 characters.`;

        if (!CATEGORIES.some(c => c.link===category)) return `Specify category.`;
        if (isRegCat(category) && !CLOTHING_SIZES.includes(size)) return `Specify clothing size.`;
        if (!GENDERS.includes(gender)) return `Specify gender.`;

        if (Number(price)<0 || Number(price)>9999.99) return `Price must be between $0 and $9,999.99.`;

        if (images.length<=0 || images.length>5) return `Must provide 1 to 5 images.`;

        return ``;
    }();

    return { valid: (msg===``), msg: msg };
}
export const editPostDataFromInputs = (data: InputEditPostData) => {
    const { price, ...overlapData } = data;
    const postData: EditPostData = {
        ...overlapData,
        price: Number(price)
    }
    return postData;
}







export const hasBuyerInterestExpired = (buyerInterest: BuyerInterest) => {
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - buyerInterest.createdAt.getTime();
    const minutesDifference = timeDifference / (1000 * 60);
    return minutesDifference > BUYER_INTEREST_EXPIRATION;
}




