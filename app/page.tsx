'use client'

import { useEffect, useState } from 'react';
import { PostWithRedactedUser } from '@util/prisma/types';
import Loading from '@components/Loading';

import VerticalLayout from '@components/containers/VerticalLayout';
import AllCategories from '@components/pages/Root';
import { UserFiltersType } from '@components/pages/shop/Filters';
import { AlertType, CheckIfAlert } from '@components/Alert';


export default function Page() {
    const [page, setPage] = useState<number>(1);
    const [maxPages, setMaxPages] = useState<number>(0);

    const [filters, setFilters] = useState<UserFiltersType>({
        sizes: [],
        gender: 'Unisex',
        categories: [],
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
            {loading ? 
                <Loading />
            :
                <CheckIfAlert 
                    alert={alert}
                    
                    content={<AllCategories posts={posts} filters={filters} setFilters={setFilters} page={page} maxPages={maxPages} setPage={setPage} />}
                />
            }
        </VerticalLayout>
    );
}

