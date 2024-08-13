import { NextRequest, NextResponse } from 'next/server';

import { isValidEmail, hashPassword } from '@util/api/user';

// import { CONTACT_EMAIL } from '@util/env';

// import { createAuthToken } from '@util/api/auth';
import { getAllPosts, getFilteredPosts } from '@util/prisma/actions/posts';



// Fetch posts to display on homepage
// We first display categories, might not need api route for that.
// no app/api/route.ts file needed??? 
// export async function GET(req: NextRequest) {
//     const { userData } = await req.json();

//     if (!userData) return NextResponse.json({ cStatus: 101, msg: `No itemData provided. Refresh this page.` }, { status: 400 });
//     if (!userData.email || !userData.password || userData.password==='') return NextResponse.json({ cStatus: 101, msg: `Some data fields are missing.` }, { status: 400 });
//     if (!isValidEmail(userData.email)) return NextResponse.json({ cStatus: 102, msg: `Use your Illinois email.` }, { status: 400 });

//     const userPrisma = await prisma.user.findUnique({
//         where: {email: userData.email}
//     });

//     if (!userPrisma) return NextResponse.json({ cStatus: 404, msg: `User does not exist. Sign up.` }, { status: 400 });
//     if (userPrisma.banned) return NextResponse.json({ cStatus: 410, msg: `This account has been banned: ${userPrisma.banMsg}` }, { status: 400 });
//     if (userPrisma.deleted) return NextResponse.json({ cStatus: 411, msg: `This account has been deleted. Please email ${CONTACT_EMAIL} to reactivate your account.` }, { status: 400 });


//     const hashedPassword = await hashPassword(userData.password);
//     if (hashedPassword !== userPrisma.password) return NextResponse.json({ cStatus: 102, msg: `Wrong password.` }, { status: 400 });


//     const token = await createAuthToken(userPrisma.id);
//     return NextResponse.json({ cStatus: 200, msg: `Success.`, token: token }, { status: 200 });
// }


export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const spCategories = searchParams.get('categories');
        const spGender = searchParams.get('gender');
        const spSizes = searchParams.get('sizes');
        const spMinPrice = searchParams.get('minPrice');
        const spMaxPrice = searchParams.get('maxPrice');
        const spPage = searchParams.get('page');

        console.log(spCategories, "  g:", spGender, "  s:", spSizes, "  min:", spMinPrice, spMaxPrice, spPage)
        if (spCategories==undefined || spGender==undefined || spSizes==undefined || spMinPrice==undefined || spMaxPrice==undefined || spPage==undefined) {
            return NextResponse.json({ cStatus: 102, msg: `Missing filter parameter fields.` }, { status: 400 });
        }

        const filters = {
            categories: spCategories.split(','),
            gender: spGender,
            sizes: spSizes.split(','),
            minPrice: Number(spMinPrice),
            maxPrice: Number(spMaxPrice)
        }

        console.log(filters)
        const posts = await getFilteredPosts(filters, Number(spPage));
        return NextResponse.json({ cStatus: 200, msg: `Success.`, posts: posts }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}