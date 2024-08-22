import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { isAdmin, createSuperPost, SuperPostData } from '@util/prisma/actions/admin';
import { CATEGORIES, CLOTHING_SIZES, GENDERS, isRegCat } from '@util/global';
import { isValidPostDataImage, isValidPrice } from '@util/api/posts';
import { getRedactedUserFromAuth } from '@util/prisma/actions/user';



export async function POST(req: NextRequest) {
    try {
        const authTokenCookie = cookies().get('authtoken');
        const resPermissions = await isAdmin(authTokenCookie);
        if (!resPermissions) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });

        const data = await req.formData();
        const postData = getSuperPostData(data);
        if (!postData) return NextResponse.json({ cStatus: 101, msg: `Some fields are missing or invalid.` }, { status: 400 });
        const resValidPost = isValidSuperPostData(postData);
        if (!resValidPost.valid) return NextResponse.json({ cStatus: 101, msg: resValidPost.msg }, { status: 400 });

        const adminPrisma = await getRedactedUserFromAuth((authTokenCookie as any).value);
        if (!adminPrisma) return NextResponse.json({ cStatus: 400, msg: `Unauthorized.` }, { status: 400 });
        const postId = await createSuperPost(postData, adminPrisma.id);

        return NextResponse.json({ cStatus: 200, msg: `Success.`, postId: postId }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
} 



const getSuperPostData = (formData: FormData) => {
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category') as string;
    const size = formData.get('size');
    const gender = formData.get('gender');
    const price = formData.get('price');
    const images = formData.getAll('images') as File[];
    const months = formData.get('months');

    if (!title || !description || !category || (isRegCat(category) && (!size || !gender)) || !price || !images || !months) return null;

    const postData: SuperPostData = {
        title: title as string,
        description: description as string,
        category: category as string,
        size: size as any,
        gender: gender as string,
        price: Math.round(Number(price)*100)/100,
        images: images,
        months: Math.floor(Number(months)),
    }
    return postData;
}



const isValidSuperPostData = (postData: SuperPostData) => {
    const { title, description, category, size, gender, price, images, months } = postData;

    let msg = '';

    if (title.length==50) msg = `Title must be less than 50 characters.`;
    if (description.length==300) msg = `Description must be less than 300 characters.`;

    if (!CATEGORIES.some(c => c.link===category)) msg = `Specify category.`;
    if (!CLOTHING_SIZES.includes(size) && !isRegCat(size)) msg = `Specify clothing size.`;
    if (!GENDERS.includes(gender)) msg = `Specify gender.`;

    if (!isValidPrice(price)) msg = `Price must be between $0 and $9,999.99.`;

    if (images.length<=0 || images.length>5) msg = `Must provide 1 to 5 images.`;
    for (let i=0; i<images.length; i++) {
        const resValidPost = isValidPostDataImage(images[i]);
        if (!resValidPost.valid) msg = (resValidPost.nextres as any).msg;
    }

    if (months<=0) msg = `Listing period must be over 0.`;

    return { valid: (msg===''), msg: msg };
}