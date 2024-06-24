import { Item } from '@prisma/client';

import { pfpImgUrl } from '@util/global';

import accountStyles from '@styles/pages/account.module.css';



export function Pfp({ pfp }: { pfp: string | null }) {
    return (
        <>
            {!pfp ?
                <img className={accountStyles.pfp} alt='Profile Picture' src='/ui/default-profile-picture.png'  />
            :
                <img className={accountStyles.pfp} alt='Profile Picture' src={pfpImgUrl(pfp)} />
            }
        </>
    );
}



export function Post({ item }: { item: Item }) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer'}} onClick={() => console.log('go to app/item/[id]')}>
            {/* a tag? */}
            <h2>{item.title}</h2>
            <img src={item.images[0]} />
        </div>
    );
}