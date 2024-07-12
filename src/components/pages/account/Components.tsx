import { Post } from '@prisma/client';

import { DEFAULT_PFP, imgUrl } from '@util/global';

import accountStyles from '@styles/pages/account.module.css';



export function Pfp({ pfp }: { pfp: string | null }) {
    return (
        <>
            {!pfp ?
                <img className={accountStyles.pfp} alt='Profile Picture' src={DEFAULT_PFP}  />
            :
                <img className={accountStyles.pfp} alt='Profile Picture' src={imgUrl(pfp)} />
            }
        </>
    );
}



export function PostComponent({ post }: { post: Post | null }) {
    const img = imgUrl('Black.jpg');
    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer'}} onClick={() => console.log('go to app/item/[id]')}>
            {/* a tag? */}
            {/* <h2>{item.title}</h2>
            <img src={item.images[0]} /> */}
            <h2>Black Nike Hoodie</h2>
            <img src={img} />
        </div>
    );
}