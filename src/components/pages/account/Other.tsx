import { User, Post } from '@prisma/client';

import CenterLayout from '@components/containers/CenterLayout';
import { Pfp, PostComponent } from './Components';

import { formatPhoneNumber } from '@util/ui/account';

import accountStyles from '@styles/pages/account.module.css';


export function OtherAccount({ user, posts }: { user: User, posts: Post[] }) {
    return (
        <div className={accountStyles.container}>
            <Header user={user} />
            <Posts posts={posts}  />
        </div>
    );
}



function Header({ user }: { user: User }) {
    const { displayName, email, profilePicture, phoneNumber } = user;
    return (
        <div className={accountStyles.header}>
            <Pfp pfp={profilePicture} />
            <div style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'clip'}}>
                <h1 className={accountStyles.displayName}>{displayName}</h1>
                <h3 className={accountStyles.email}>{email}</h3>
                {phoneNumber!='' && <h3 className={accountStyles.email}>{formatPhoneNumber(phoneNumber)}</h3>}
            </div>
        </div>
    );
}



function Posts({ posts }: { posts: Post[] }) {
    return (
        <div className={accountStyles.viewPostsContainer}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '5px'}}>
                <div className={accountStyles.postsButton} style={{cursor: 'default'}}>
                    <h3>Posts</h3>
                </div>
            </div>
            <div className={accountStyles.postsContainer}>
                {posts.length===0 && <CenterLayout><h3>This user has no active posts.</h3></CenterLayout>}
                {posts.map((post) => <PostComponent post={post} /> )}
            </div>
        </div>
    );
}