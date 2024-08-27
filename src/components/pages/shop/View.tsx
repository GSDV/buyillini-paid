import { PostWithRedactedUser, RedactedUser } from '@util/prisma/types';

import CenterLayout from '@components/containers/CenterLayout';

import { getPfpUrl, imgUrl } from '@util/global';

import shopStyles from '@styles/pages/shop.module.css';



export default function ViewPosts({ noPosts, posts }: { noPosts: string, posts: PostWithRedactedUser[] }) {
    return (
        <>
            {posts.length==0 ?
                <CenterLayout><h3 style={{textAlign: 'center'}}>{noPosts}</h3></CenterLayout>
            :
                <div className={shopStyles.postsWrapper}>
                    {posts.map((post, i) => <PostComponent post={post} key={i} /> )}
                </div>
            }
        </>
    );
}

function PostComponent({ post }: { post: PostWithRedactedUser }) {
    const img = imgUrl(post.images[0]);
    return (
        <div className={shopStyles.postContainer}>
            {/* <PostHeader user={post.seller} /> */}
            <a className={shopStyles.post} href={`/post/${post.id}`} target='_blank'>
                <div className={shopStyles.postImgWrapper}>
                    <img src={img} />
                </div>
                <h4>{post.title}</h4>
            </a>
        </div>
    );
}

function PostHeader({ user }: { user: RedactedUser }) {
    const pfpUrl = getPfpUrl(user.profilePicture);
    return (
        <div className={shopStyles.postHeader}>
            <a href={`/account/${user.netId}`} target='_blank'><img src={pfpUrl} /></a>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4>{user.displayName}</h4>
                <h5>{user.netId}</h5>
            </div>
        </div>
    );
}

