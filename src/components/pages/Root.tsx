import { PostWithRedactedUser } from '@util/prisma/types';

import ViewPosts from '@components/pages/shop/View';
import { Filters, UserFiltersType } from '@components/pages/shop/Filters';
import PageArrows from '../Arrows';



interface AllCategoriesType {
    posts: PostWithRedactedUser[],
    filters: UserFiltersType,
    setFilters: React.Dispatch<React.SetStateAction<UserFiltersType>>
    page: number,
    maxPages: number,
    setPage: React.Dispatch<React.SetStateAction<number>>
}

export default function AllCategories({ posts, filters, setFilters, page, setPage, maxPages }: AllCategoriesType) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px', width: '100%'}}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', alignItems:'center' }}>
                <h4 style={{textAlign: 'center'}}><a href='/shop/'>See all categories</a></h4>
                <Filters filters={filters} setFilters={setFilters} />
                <PageArrows page={page} max={maxPages} setPage={setPage} />
                <ViewPosts noPosts='No posts match the filters' posts={posts} />
                <PageArrows page={page} max={maxPages} setPage={setPage} />
            </div>
        </div>
    );
}