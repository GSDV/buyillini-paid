'use client';

import { useEffect, useState } from 'react';
import { PostWithRedactedUser } from '@util/prisma/types';
import Loading, { CheckIfLoading } from '@components/Loading';

import VerticalLayout from '@components/containers/VerticalLayout';
import { AlertType, CheckIfAlert } from '@components/Alert';



import ViewPosts from '@components/pages/shop/View';
import { CategoryFilters, UserFiltersType } from '@components/pages/shop/Filters';

import PageArrows from '@components/Arrows';




export default function CategoryPosts({ params }: { params: { category: string } }) {
    const [page, setPage] = useState<number>(1);
    const [maxPages, setMaxPages] = useState<number>(0);

    const [filters, setFilters] = useState<UserFiltersType>({
        sizes: [],
        gender: 'Unisex',
        categories: [params.category],
        maxPrice: 9999.99,
        minPrice: 0,
        deleted: false
    });
    const [posts, setPosts] = useState<PostWithRedactedUser[]>([]);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPosts = async (fetchPage: number) => {
        setLoading(true);
        const params = new URLSearchParams({
            sizes: filters.sizes.join(','),
            gender: filters.gender,
            categories: filters.categories.join(','),
            minPrice: String(filters.minPrice),
            maxPrice: String(filters.maxPrice),
            deleted: String(filters.deleted),
            page: String(fetchPage)
        }).toString();

        const res = await fetch(`/shop/api?${params}`, { method: 'GET' });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            setPosts(resJson.posts);
            setMaxPages(resJson.maxPages);
        }
        setAlert(resJson);
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts(page);
    }, [filters, page]);

    return (
        <VerticalLayout>
            <CheckIfLoading loading={loading} content={
                <CheckIfAlert alert={alert} content={
                    <Category posts={posts} filters={filters} setFilters={setFilters} page={page} maxPages={maxPages} setPage={setPage} />
                } />
            } />
        </VerticalLayout>
    );
}




interface CategoriesType {
    posts: PostWithRedactedUser[],
    filters: UserFiltersType,
    setFilters: React.Dispatch<React.SetStateAction<UserFiltersType>>
    page: number,
    maxPages: number,
    setPage: React.Dispatch<React.SetStateAction<number>>
}

function Category({ posts, filters, setFilters, page, setPage, maxPages }: CategoriesType) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px', width: '100%'}}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', alignItems:'center' }}>
                <CategoryFilters filters={filters} setFilters={setFilters} />
                <PageArrows page={page} max={maxPages} setPage={setPage} />
                <ViewPosts noPosts='No posts match the filters' posts={posts} />
                <PageArrows page={page} max={maxPages} setPage={setPage} />
            </div>
        </div>
    );
}
