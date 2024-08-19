import { BuyerInterest, Post } from '@prisma/client';
import { ACCEPTED_FILES, BUYER_INTEREST_EXPIRATION, CATEGORIES, CLOTHING_SIZES } from '@util/global';
import { EditPostData, PostData } from '@util/prisma/actions/posts';



export const isPostValid = (post: Post | null) => {
    if (!post) return { valid: false, nextres: { cStatus: 430, msg: `Post does not exist.` } };
    if (!post.active) return { valid: false, nextres: { cStatus: 432, msg: `This post is not active` } };
    const currentDate = new Date();
    if (currentDate > post.expireDate) return { valid: false, nextres: { cStatus: 434, msg: `This post has expired.` } };
    if (post.deleted) return { valid: false, nextres: { cStatus: 433, msg: `This post has been deleted.` } };
    return { valid: true };
}


export const isValidEditPostData = (postData: EditPostData) => {
    const data: PostData = { ...postData, months: 1, userFreeMonths: 0 };
    return isValidPostData(data)
}

export const isValidPostData = (postData: PostData) => {
    const { title, description, category, size, gender, price, images, months, userFreeMonths } = postData;

    let msg = '';

    if (title.length==50) msg = `Title must be less than 50 characters.`;
    if (description.length==300) msg = `Description must be less than 300 characters.`;

    if (!CATEGORIES.some(c => c.link===category)) msg = `Specify category.`;
    if (!CLOTHING_SIZES.includes(size) && category!='other') msg = `Specify clothing size.`;
    if (gender!="Male" && gender!="Female" && gender!="Unisex") msg = `Specify gender.`;

    if (!isValidPrice(price)) msg = `Price must be between $0 and $9,999.99.`;

    console.log("D 111");
    if (images.length<=0 || images.length>5) msg = `Must provide 1 to 5 images.`;
    for (let i=0; i<images.length; i++) {
        console.log("D 222 ", i);
        const resValidPost = isValidPostDataImage(images[i]);
        console.log("D 333 ", i, resValidPost);
        if (!resValidPost.valid) return { valid: false, nextres: resValidPost.nextres };
    }

    if (months<=0 || months>10) msg = `Listing period must be between 1 and 10.`;
    if (userFreeMonths<0 || userFreeMonths>10) msg = `Free months used must be between 0 and 10.`;
    if (userFreeMonths > months) msg = `You specified more free months than listing duration.`;

    return { valid: (msg===''), msg: msg };
}



export const isValidPrice = (price: number) => {
    return price>=0 && price<=9999.99;
}



export const isValidPostDataImage = (img: any) => {
    console.log("JJJ 1")
    if (!(img instanceof File)) return { valid: false, nextres: {cStatus: 102, msg: `Please upload a png, jpg, or webp file.`} };
    console.log("JJJ 2")
    if (!ACCEPTED_FILES.includes(img.type)) return { valid: false, nextres: {cStatus: 102, msg: `Please upload a png, jpg, or webp file.`} };
    console.log("JJJ 3")
    if (img.size > 5000000) return { valid: false, nextres: {cStatus: 102, msg: `Please upload a picture under 5 MBs.`} };
    console.log("JJJ 4")
    return { valid: true };
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
        images: formData.getAll('images') as File[]
    }
    return postData;
}



export const getPostData = (formData: FormData) => {
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const size = formData.get('size');
    const gender = formData.get('gender');
    const price = formData.get('price');
    const images = formData.getAll('images') as File[];
    const months = formData.get('months');
    const userFreeMonths = formData.get('userFreeMonths');

    if (!title || !description || !category || (category!='other' && (!size || !gender)) || !price || !images || !months) return null;

    const postData: PostData = {
        title: title as string,
        description: description as string,
        category: category as string,
        size: size as any,
        gender: gender as string,
        price: Math.round(Number(price)*100)/100,
        images: formData.getAll('images') as File[],
        months: Math.floor(Number(months)),
        userFreeMonths: Math.floor(Number(userFreeMonths))
    }
    return postData;
}




export const hasBuyerInterestExpired = (buyerInterest: BuyerInterest) => {
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - buyerInterest.createdAt.getTime();
    const minutesDifference = timeDifference / (1000 * 60);
    return minutesDifference > BUYER_INTEREST_EXPIRATION;
}