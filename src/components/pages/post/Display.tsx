import { useRouter } from 'next/navigation';

import { PostWithRedactedUser } from '@util/prisma/types';
import ViewPost from '@components/pages/post/View';
import { formatPhoneNumber, getPfpUrl, imgUrl } from '@util/global';
import Link from 'next/link';

import { useMenuShadowContext } from '@components/providers/MenuShadow';
import displayStyles from '@styles/pages/display-post.module.css';
import { useState } from 'react';
import { Alert, AlertType } from '@components/Alert';
import Form, { FormInputType } from '@components/Form';
import { BsXCircle } from 'react-icons/bs';
import { colorScheme } from '@styles/colors';
import formStyles from '@styles/ui/form.module.css';
import { CheckIfLoading, LoadingIconBlack } from '@components/Loading';



export default function DisplayPost({ post, cStatus }: { post: PostWithRedactedUser, cStatus: number }) {
    const msContext = useMenuShadowContext();
    const router = useRouter();
    const [alert, setAlert] = useState<AlertType | null>(null);

    const promptDeletePost = () => {
        msContext.setContent(<DeletePost postId={post.id} sellerNetId={post.seller.netId} />);
        msContext.openMenu();
    }

    return (
        <div className={displayStyles.container}>
            <Header post={post} />

            <ViewPost post={post} />

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', width: '100%', padding: '10px 40px' }}>
                {(cStatus==202 && !post.deleted) && <>
                    <button onClick={()=>router.push(`/post/${post.id}/edit`)}>Edit</button>
                    <button style={{ backgroundColor: 'var(--red)' }} onClick={promptDeletePost}>Delete</button>
                </>}

                {cStatus==203 && <>
                    <ReportPost postId={post.id} setAlert={setAlert} />
                    <BuyPost postId={post.id} setAlert={setAlert} />
                </>}

                {cStatus==200 && <h4 style={{color: 'var(--grey)'}}>Log in to buy post</h4>}
                
                {/* For future */}
                {/* {post.deleted && <button onClick={()=>console.log('repost')}>Repost</button>} */}
            </div>

            {alert && <Alert alert={alert}  />}
        </div>
    );
}






function DeletePost({ postId, sellerNetId }: { postId: string, sellerNetId: string }) {
    const msContext = useMenuShadowContext();

    const router = useRouter();
    const [alert, setAlert] = useState<AlertType | null>(null);

    const attemptDeletePost = async () => {
        const res = await fetch(`/post/${postId}/api`, { method: 'DELETE' });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            msContext.closeMenu();
            router.push(`/account/${sellerNetId}`);
        }
        setAlert(resJson);
    }

    return (
        <div className='msContainer'>
            <BsXCircle onClick={msContext.closeMenu} size={30} color={colorScheme.black} className='msClose' />
            <div className={formStyles.container}>
                <h1 style={{textAlign: 'center', width: '80%'}}>Are you sure you want to delete this post?</h1>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px' }}>
                    <button onClick={msContext.closeMenu} className='bgGrey'>No</button>
                    <button onClick={attemptDeletePost} className='bgRed'>Yes, delete</button>
                </div>
            </div>
            {alert && <Alert alert={alert}  />}
        </div>
    );
}


function Header({ post }:{ post: PostWithRedactedUser }) {
    const user = post.seller;
    return (
        <div className={displayStyles.header}>
            <Link href={`/account/${user.netId}`}>
                <img style={{ borderRadius: '50%', cursor: 'pointer' }} src={getPfpUrl(user.profilePicture)} alt='Profile Picture' width={70} height={70} />
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'top' }}>
                <h3>{user.displayName}</h3>
                <h4>{user.email}</h4>
                {user.phoneNumber!='' && <h4>{formatPhoneNumber(user.phoneNumber)}</h4>}
            </div>
        </div>
    );
}



function ReportPost({ postId, setAlert }: { postId: string, setAlert: React.Dispatch<React.SetStateAction<AlertType | null>> }) {
    const msContext = useMenuShadowContext();

    const attemptReportPost = async (formData: FormData) => {
        const msg = formData.get('report');
        const res = await fetch(`/post/${postId}/api`, {
            method: 'POST',
            body: JSON.stringify({msg}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        setAlert(resJson);
        msContext.closeMenu();
    }

    const promptReportPost = async () => {
        const inputs: FormInputType[] = [{title: 'Message', name: 'report', type: 'text'}];

        msContext.setContent(
            <div className='msContainer'>
                <BsXCircle onClick={msContext.closeMenu} size={30} color={colorScheme.black} className='msClose' />
                <h1>Report Post</h1>
                <Form action={attemptReportPost} inputs={inputs} submitTitle='Send' />
            </div>
        );
        msContext.openMenu();
    }

    return <button style={{ backgroundColor: 'var(--red)' }} onClick={promptReportPost}>Report Post</button>;
}



function BuyPost({ postId, setAlert }: { postId: string, setAlert: React.Dispatch<React.SetStateAction<AlertType | null>> }) {
    const msContext = useMenuShadowContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [hasBought, setHasBought] = useState<boolean>(false);

    const attemptBuyPost = async (msg: string) => {
        setLoading(true);
        const res = await fetch(`/post/${postId}/api`, {
            method: 'PUT',
            body: JSON.stringify({msg}),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) setHasBought(true);
        else setAlert(resJson);
        msContext.closeMenu();
        setLoading(false);
    }

    const promptContactMessage = async () => {
        msContext.setContent(<BuyPostMessage attemptBuyPost={attemptBuyPost} />);
        msContext.openMenu();
    }

    return (
        <>{hasBought ?
            <h4 style={{color: 'var(--grey)'}}>Email has been sent!</h4>
        :
            <>{loading ?
                <LoadingIconBlack />
            :
                <button style={{ backgroundColor: 'var(--orangePrimary)' }} onClick={promptContactMessage}>Contact Seller</button>
            }</>
        }</>
    );
}

function BuyPostMessage({ attemptBuyPost }: { attemptBuyPost: (msg: string)=>void }) {
    const msContext = useMenuShadowContext();
    const [msg, setMsg] = useState<string>('');

    return (
        <div className='msContainer'>
            <BsXCircle onClick={msContext.closeMenu} size={30} color={colorScheme.black} className='msClose' />
            <h1>Add a message for the seller</h1>
            <div>
                <h4>Optional Message</h4>
                <textarea style={{ maxWidth: '500px', maxHeight: '200px' }} value={msg} onChange={(e)=>setMsg(e.target.value)} />
            </div>
            <button style={{ margin: '20px', alignSelf: 'center' }} onClick={()=>attemptBuyPost(msg)} type='submit'>Contact Seller</button>
        </div>
    );
}