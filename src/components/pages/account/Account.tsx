'use client'


import { Post } from '@prisma/client';
import { RedactedUser } from '@util/prisma/types';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { BsGear, BsXCircle } from 'react-icons/bs';

import { DEFAULT_PFP, IMG_ACCEPTED_FILES, imgUrl } from '@util/global';

import { useMenuShadowContext } from '@components/providers/MenuShadow';

import CenterLayout from '@components/containers/CenterLayout';
import Loading, { CheckIfLoading } from '@components/Loading';
import { Alert, AlertType, CheckIfAlert } from '@components/Alert';

import { formatPhoneNumber } from '@util/global';

import accountStyles from '@styles/pages/account.module.css';
import formStyles from '@styles/ui/form.module.css';

import clsx from 'clsx';
import { colorScheme } from '@styles/colors';
import PageArrows from '@components/Arrows';
import Link from 'next/link';
import { useAuthContext } from '@components/providers/Auth';




export default function Account({ user, ownAccount }: { user: RedactedUser, ownAccount: boolean }) {
    return (
        <div className={accountStyles.container}>
            <Header user={user} ownAccount={ownAccount} />
            {ownAccount && <Buttons freeMonths={user.freeMonths} />}
            {ownAccount ? <OwnPosts userId={user.id} /> : <OtherPosts userId={user.id} /> }
        </div>
    );
}



function Header({ user, ownAccount }: { user: RedactedUser, ownAccount: boolean }) {
    const { displayName, email, profilePicture, phoneNumber } = user;
    const msContext = useMenuShadowContext();
    const openSettingsMenu = () => {
        msContext.setContent(<SettingsMenu user={user} />);
        msContext.openMenu();
    }

    return (
        <div className={accountStyles.header}>
            <Pfp pfp={profilePicture} />

            <div style={{display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0}}>
                <h1 className={accountStyles.displayName}>{displayName}</h1>
                <h3 className={accountStyles.email}>{email}</h3>
                {phoneNumber!='' && <h3 className={accountStyles.email}>{formatPhoneNumber(phoneNumber)}</h3>}
            </div>

            {ownAccount && <BsGear onClick={openSettingsMenu} className={accountStyles.settingsIcon} />}
        </div>
    );
}



function SettingsMenu({ user }: { user: RedactedUser }) {
    const router = useRouter();
    
    const msContext = useMenuShadowContext();

    const [displayName, setDisplayName] = useState<string>(user.displayName);
    const [phoneNumber, setPhoneNumber] = useState<string>(user.phoneNumber=='' ? '' : formatPhoneNumber(user.phoneNumber));
    const [uploadedPfp, setUploadedPfp] = useState<File>();
    const pfpRef = useRef<HTMLInputElement | null>(null)

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const attemptUpdate = async () => {
        setLoading(true);
        const res = await fetch(`/account/netId/api/settings`, {
            method: 'POST',
            body: JSON.stringify({ displayName, phoneNumber, fileType: uploadedPfp?.type, fileSize: uploadedPfp?.size })
        });
        const resJson = await res.json();

        if (resJson.cStatus==204 && uploadedPfp!=null) {
            await fetch(resJson.signedUrl, {
                method: 'PUT',
                body: uploadedPfp,
                headers: { 'Content-Type': uploadedPfp.type },
            });
            await fetch(`/account/netId/api/settings`, {
                method: 'PUT',
                body: JSON.stringify({ operation: 'CROP_PFP', key: resJson.key })
            });
        }

        if (resJson.cStatus==200 || resJson.cStatus==204) {
            msContext.closeMenu();
            window.location.reload();
        }

        setAlert(resJson);
        setLoading(false);
    }

    const promptDeleteAccount = () => {
        msContext.setContent(<DeleteAccount netId={user.netId} />);
        msContext.openMenu();
    }

    const redirectToResetPassword = () => {
        msContext.closeMenu();
        router.push('/password/');
    }

    return (
        <div className='msContainer'>
            {loading ?
                <div style={{width: '300px', height: '300px'}}>
                    <Loading />
                </div>
            :
            <>
                <BsXCircle onClick={msContext.closeMenu} size={30} color={colorScheme.black} className='msClose' />
                <h1>Settings</h1>

                <div className={formStyles.container}>
                    <div className={formStyles.formItem} style={{width: '100%', maxWidth: '200px'}}>
                        <h4>Profile Picture</h4>
                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => pfpRef.current?.click()} style={{cursor: 'pointer', alignSelf: 'center'}}>Upload Image</button>
                        <input ref={pfpRef} type='file' accept={IMG_ACCEPTED_FILES} onChange={(e) => setUploadedPfp(e.target.files?.[0])} style={{display: 'none'}} />
                        {uploadedPfp && <h6 style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Uploaded: {uploadedPfp.name}</h6>}
                    </div>
                    <div className={formStyles.formItem}>
                        <h4>Display Name</h4>
                        <input type='text' name='displayName' value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div className={formStyles.formItem}>
                        <h4>Phone Number</h4>
                        <input type='text' name='phone' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                    <button onClick={redirectToResetPassword}>Reset Password</button>
                    <button className='bgRed' onClick={promptDeleteAccount}>Delete Account</button>

                    {alert && <Alert alert={alert}  />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px' }}>
                    <button className='bgGrey' onClick={msContext.closeMenu}>Close</button>
                    <button onClick={attemptUpdate}>Save</button>
                </div>
            </>
            }
        </div>
    );
}



function Buttons({ freeMonths }: { freeMonths: number }) {
    const { fetchCookie } = useAuthContext();
    
    const attemptLogout = async () => {
        const res = await fetch(`/account/api/`, { method: 'PUT' });
        fetchCookie(); // fetchCookie to keep authContext updated
        window.location.reload(); // Page reload to display "Other" page instead of "Own"
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', alignItems: 'flex-start' }}>
            <button onClick={attemptLogout} style={{ backgroundColor: 'var(--red)', alignSelf: 'flex-start' }}>Log Out</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Link href='/create/' style={{width: 'fit-content'}}><button style={{ alignSelf: 'flex-start' }}>Post</button></Link>
                <h5 style={{ color: 'var(--grey)' }}>Free months left: {freeMonths}</h5>
            </div>
        </div>
    );
}



function DeleteAccount({ netId }: { netId: string }) {
    const { fetchCookie } = useAuthContext();
    const msContext = useMenuShadowContext();

    const router = useRouter();
    const [alert, setAlert] = useState<AlertType | null>(null);

    const deleteAccount = async () => {
        const res = await fetch(`/account/${netId}/api`, { 
            method: 'DELETE',
            body: JSON.stringify({ netId }),
            headers: { 'Content-Type': 'application/json' }
         });
         const resJson = await res.json();
         if (resJson.cStatus==200) {
            fetchCookie();
            msContext.closeMenu();
            router.push(`/`);
        }
         setAlert(resJson);
    }
    return (
        <div className='msContainer'>
            <BsXCircle onClick={msContext.closeMenu} size={30} color={colorScheme.black} className='msClose' />
            <div className={formStyles.container}>
                <h1 style={{textAlign: 'center', width: '80%'}}>Are you sure you want to delete your account?</h1>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px' }}>
                    <button onClick={msContext.closeMenu} className='bgGrey'>No</button>
                    <button onClick={deleteAccount} className='bgRed'>Yes, delete</button>
                </div>
            </div>
            {alert && <Alert alert={alert}  />}
        </div>
    );
}





function OwnPosts({ userId }: { userId: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState<number>(1);
    const [maxPages, setMaxPages] = useState<number>(1);

    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [active, setActive] = useState<boolean>(true);

    const fetchPosts = async () => {
        setLoading(true);
        const res = await fetch(`/account/api/`, {
            method: 'POST',
            body: JSON.stringify({ userId, page, deleted: !active }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            setPosts(resJson.posts)
            setMaxPages(resJson.maxPages);
        }
        setAlert(resJson);
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts()
    }, [page, active]);
    

    const activeTab = clsx({
        [accountStyles.postsButton] : true,
        [accountStyles.postsButtonFocused] : active
    });
    const pastTab = clsx({
        [accountStyles.postsButton] : true,
        [accountStyles.postsButtonFocused] : !active
    });

    return (
        <div className={accountStyles.viewPostsContainer}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '5px'}}>
                <div className={activeTab} onClick={() => setActive(true)}>
                    <h3>Active Posts</h3>
                </div>
                <div className={pastTab} onClick={() => setActive(false)}>
                    <h3>Past Posts</h3>
                </div>
            </div>
   
            <div className={accountStyles.postsContainer}>
                <CheckIfLoading loading={loading} content={
                    <CheckIfAlert alert={alert}  content={
                        <ActiveOrPastPosts active={active} posts={posts} page={page} max={maxPages} setPage={setPage} />
                    } />
                }/>
            </div>

        </div>
    );
}

function ActiveOrPastPosts({ active, posts, page, max, setPage }: { active: boolean, posts: Post[], page: number, max: number, setPage: React.Dispatch<React.SetStateAction<number>> }) {
    if (active) return <Posts noPosts='You have no active posts.' posts={posts} page={page} max={max} setPage={setPage} />;
    return <Posts noPosts='You have no past posts.' posts={posts} page={page} max={max} setPage={setPage} />;
}



function OtherPosts({ userId }: { userId: string }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState<number>(1);
    const [maxPages, setMaxPages] = useState<number>(1);

    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        const res = await fetch(`/account/api/`, {
            method: 'POST',
            body: JSON.stringify({ userId, page, deleted: false }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            setPosts(resJson.posts)
            setMaxPages(resJson.maxPages);
        }
        setAlert(resJson);
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts()
    }, [page]);

    return (
        <div className={accountStyles.postsContainer}>
            <CheckIfLoading loading={loading} content={
                <CheckIfAlert alert={alert}  content={
                    <Posts noPosts='This account has no active posts.' posts={posts} page={page} max={maxPages} setPage={setPage} />
                } />
            } />
        </div>
    );
}



interface PostsType {
    noPosts: string,
    posts: Post[],
    page: number,
    max: number,
    setPage: React.Dispatch<React.SetStateAction<number>>
}
function Posts({ noPosts, posts, page, max, setPage }: PostsType) {
    if (posts.length==0) return <CenterLayout><h3>{noPosts}</h3></CenterLayout>;

    return (
        <>
            <div className={accountStyles.postsWrapper}>
                {posts.map((post, i) => <PostComponent key={i} post={post} /> )}
            </div>
            <PageArrows page={page} max={max} setPage={setPage} />
        </>
    );
}


function PostComponent({ post }: { post: Post }) {
    const img = imgUrl(post.images[0]);
    return (
        <div className={accountStyles.postContainer}>
            <a className={accountStyles.post} href={`/post/${post.id}`} target='_blank'>
                <div className={accountStyles.postImgWrapper}>
                    <img src={img} />
                </div>
                <h4>{post.title}</h4>
            </a>
        </div>
    );
}



export function Pfp({ pfp }: { pfp: string | null }) {
    if (!pfp) return <img className={accountStyles.pfp} alt='Profile Picture' src={DEFAULT_PFP} />;
    return <img className={accountStyles.pfp} alt='Profile Picture' src={imgUrl(pfp)} />;
}