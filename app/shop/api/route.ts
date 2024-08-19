import { NextRequest, NextResponse } from 'next/server';

import { findMaxPages, getFilteredPosts } from '@util/prisma/actions/posts';



// Used for fetching filtered posts
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const spCategories = searchParams.get('categories');
        const spGender = searchParams.get('gender');
        const spSizes = searchParams.get('sizes');
        const spMinPrice = searchParams.get('minPrice');
        const spMaxPrice = searchParams.get('maxPrice');
        const spDeleted = searchParams.get('deleted');
        const spPage = searchParams.get('page');

        if (spCategories==undefined || spGender==undefined || spSizes==undefined || spMinPrice==undefined || spMaxPrice==undefined || spPage==undefined || spDeleted==undefined) {
            return NextResponse.json({ cStatus: 102, msg: `Missing filter parameter fields. Refresh the page.` }, { status: 400 });
        }

        const filters = {
            categories: spCategories.split(','),
            gender: spGender,
            sizes: spSizes.split(','),
            minPrice: Number(spMinPrice),
            maxPrice: Number(spMaxPrice),
            deleted: spDeleted=='true'
        }

        const posts = await getFilteredPosts(filters, Number(spPage));
        const maxPages = await findMaxPages(filters);
        return NextResponse.json({ cStatus: 200, msg: `Success.`, posts: posts, maxPages: maxPages }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ cStatus: 900, msg: `Server error: ${err}` }, { status: 400 });
    }
}