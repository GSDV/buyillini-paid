import { User, Post } from '@prisma/client';

import { useRef, useState } from 'react';

import { BsGear, BsXCircle } from 'react-icons/bs';

import { IMG_ACCEPTED_FILES } from '@util/global';

import { useReloaderContext } from '@components/providers/Reloader';
import { useMenuShadowContext } from '@components/providers/MenuShadow';

import CenterLayout from '@components/containers/CenterLayout';
import { Pfp, PostComponent } from './Components';
import Loading from '@components/Loading';
import { Alert, AlertType } from '@components/Alert';

import { formatPhoneNumber } from '@util/ui/account';

import accountStyles from '@styles/pages/account.module.css';
import formStyles from '@styles/ui/form.module.css';

import clsx from 'clsx';
import { colorScheme } from '@styles/colors';



export const orangeButton = clsx({
    [accountStyles.button] : true,
    [accountStyles.orange] : true
});
export const redButton = clsx( {
    [accountStyles.button] : true,
    [accountStyles.red] : true,
});
export const greyButton = clsx( {
    [accountStyles.button] : true,
    [accountStyles.grey] : true,
});



export function OwnAccount({ user, posts }: { user: User, posts: Post[] }) {
    return (
        <div className={accountStyles.container}>
            <Header user={user} />
            <Buttons freeMonths={user.freeMonths} />
            <Posts posts={posts}  />
        </div>
    );
}



function Header({ user }: { user: User }) {
    const { displayName, email, profilePicture, phoneNumber } = user;
    const msContext = useMenuShadowContext();
    const openSettingsMenu = () => {
        msContext.setContent(<SettingsMenu user={user} />);
        msContext.openMenu();
    }
    return (
        <div className={accountStyles.header}>
            <Pfp pfp={profilePicture} />

            <div style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'clip'}}>
                <h1 className={accountStyles.displayName}>{displayName}</h1>
                <h3 className={accountStyles.email}>{email}</h3>
                {phoneNumber!='' && <h3 className={accountStyles.email}>{formatPhoneNumber(phoneNumber)}</h3>}
            </div>

            <BsGear onClick={openSettingsMenu} size={70} color={colorScheme.orangePrimary} style={{marginLeft: 'auto', cursor: 'pointer'}} />
        </div>
    );
}



function SettingsMenu({ user }: { user: User }) {
    const { reload } = useReloaderContext();
    
    const msContext = useMenuShadowContext();

    const [displayName, setDisplayName] = useState<string>(user.displayName);
    const [phoneNumber, setPhoneNumber] = useState<string>(formatPhoneNumber(user.phoneNumber));
    const [uploadedPfp, setUploadedPfp] = useState<File>();
    const pfpRef = useRef<HTMLInputElement | null>(null)

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const attemptUpdate = async () => {
        const data = new FormData();
        if (uploadedPfp != undefined) data.set('pfp', uploadedPfp);
        data.set('displayName', displayName);
        data.set('phoneNumber', phoneNumber);

        setLoading(true);
        const res = await fetch('/account/netId/api/', {
            method: 'POST',
            body: data
        });
        const resJson = await res.json();
        setLoading(false);

        setAlert(resJson);
        if (resJson.cStatus==200) {
            msContext.closeMenu();
            reload();
        }
    }

    const promptDeleteAccount = () => {
        msContext.setContent(<DeleteAccount />);
        msContext.openMenu();
    }

    return (
        <div className={accountStyles.settingsMenu}>
            {loading ?
                <div style={{width: "300px", height: "300px"}}>
                    <Loading />
                </div>
            :
            <>
                <BsXCircle onClick={msContext.closeMenu} size={30} color={colorScheme.black} style={{position: 'absolute', top: '10px', left: '10px', cursor: 'pointer'}} />
                <h1>Settings</h1>

                <div className={formStyles.container}>
                    <div className={formStyles.formItem} style={{width: '100%', maxWidth: '200px'}}>
                        <h4>Profile Picture</h4>
                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => pfpRef.current?.click()} style={{cursor: 'pointer'}}><h5>Upload Image</h5></button>
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
                    <div onClick={promptDeleteAccount} className={redButton}><h4>Delete Account</h4></div>

                    {alert && <Alert alert={alert} variations={[]} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px' }}>
                    <div onClick={msContext.closeMenu} className={greyButton}><h4>Close</h4></div>
                    <div onClick={attemptUpdate} className={orangeButton}><h4>Save</h4></div>
                </div>
            </>
            }
        </div>
    );
}



function Buttons({ freeMonths }: { freeMonths: number }) {
    const { reload } = useReloaderContext();

    const attemptLogout = async () => {
        const res = await fetch('/account/netId/api/', {
            method: 'PUT'
        });
        reload();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%' }}>
            <div onClick={attemptLogout} className={redButton}><h4>Log Out</h4></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: 'fit-content' }}>
                <a href='/create/' className={orangeButton}><h4>Make a post</h4></a>
                <h5 style={{ color: '#666666' }}>Free months left: {freeMonths}</h5>
            </div>
        </div>
    );
}





function DeleteAccount() {
    const msContext = useMenuShadowContext();

    const deleteAccount = () => {
        // fetch()
        // implement this
    }

    return (
        <div className={accountStyles.settingsMenu}>
            <div className={formStyles.container}>
                <h1 style={{textAlign: 'center'}}>Are you sure you want to delete your account?</h1>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px' }}>
                    <div onClick={msContext.closeMenu} className={greyButton}><h4>No</h4></div>
                    <div onClick={deleteAccount} className={redButton}><h4>Yes, delete</h4></div>
                </div>
            </div>
        </div>
    );
}




function Posts({ posts }: { posts: Post[] }) {
    const [active, setActive] = useState<boolean>(true);
    const activePosts: Post[] = posts.filter((item) => !item.deleted);
    const pastPosts: Post[] = posts.filter((item) => item.deleted);

    return (
        <div className={accountStyles.viewPostsContainer}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '5px'}}>
                <div className={accountStyles.postsButton} onClick={() => setActive(true)}>
                    <h3>Active Posts</h3>
                </div>
                <div className={accountStyles.postsButton} onClick={() => setActive(false)}>
                    <h3>Past Posts</h3>
                </div>
            </div>
            {active ? <ActivePosts posts={activePosts} /> : <PastPosts posts={pastPosts} />}
        </div>
    );
}

function ActivePosts({ posts }: { posts: Post[] }) {
    return (
        <div className={accountStyles.postsContainer}>
            {/* {items.length===0 && <CenterLayout><h3>You have no active posts.</h3></CenterLayout>} */}
            {posts.map((post) => <PostComponent post={post} /> )}
            {/* <PostComponent item={null} /> */}
        </div>
    );
}

function PastPosts({ posts }: { posts: Post[] }) {
    return (
        <div className={accountStyles.postsContainer}>
            {posts.length===0 && <CenterLayout><h3>You have no past posts.</h3></CenterLayout>}
            {posts.map((post) => <PostComponent post={post} /> )}
        </div>
    );
}