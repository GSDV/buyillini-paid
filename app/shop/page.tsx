import VerticalLayout from '@components/containers/VerticalLayout';

import { CATEGORIES, CategoryType } from '@util/global';

import categoryStyles from '@styles/pages/pick-category.module.css'



export default function PickCategory() {
    return (
        <VerticalLayout>
            <h1>Choose a Category</h1>
            <div className={categoryStyles.grid}>
                {CATEGORIES.map((cat, i) => <Category key={i} cat={cat} />)
            }</div>
        </VerticalLayout>
    )
}



function Category({ cat }: { cat: CategoryType }) {
    return (
        <div className={categoryStyles.gridItem}>
            <a href={`/shop/${cat.link}/`} className={categoryStyles.category}>
                <div style={{ width: '100%', aspectRatio: 1, overflow: 'hidden' }}>
                    <img src={cat.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 className={categoryStyles.catTitle}>{cat.title}</h3>
            </a>
        </div>
    );
}