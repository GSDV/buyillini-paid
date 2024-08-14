import ViewPosts from '@components/pages/shop/View';
import { Filters, UserFiltersType } from '@components/pages/shop/Filters';

import { PostWithRedactedUser } from '@util/prisma/types';
import PageArrows from '../Arrows';


interface AllCategoriesType {
    posts: PostWithRedactedUser[],
    filters: UserFiltersType,
    setFilters: React.Dispatch<React.SetStateAction<UserFiltersType>>
    page: number,
    updatePage: (page: number)=>void,
    maxPages: number
}

export default function AllCategories({ posts, filters, setFilters, page, updatePage, maxPages }: AllCategoriesType) {


    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px', width: '100%'}}>
            <div style={{display: 'flex', flexDirection: 'row', gap: '20px', width: '100%'}}>
                <Filters filters={filters} setFilters={setFilters} />

                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <PageArrows page={page} max={maxPages} updatePage={updatePage} />
                    <ViewPosts noPosts='No posts match the filters' posts={posts} />
                    <PageArrows page={page} max={maxPages} updatePage={updatePage} />
                </div>
            </div>
        </div>
    );
}
