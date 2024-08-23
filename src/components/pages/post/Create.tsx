'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { BsPlusCircle, BsFillDashCircleFill } from 'react-icons/bs';

import { Post } from '@prisma/client';
import { CATEGORIES, CLOTHING_SIZES, GENDERS, IMG_ACCEPTED_FILES, MONTH_TO_MILLI, NO_SIZE_GENDER_CATEGORIES, formatDate, imgUrl } from '@util/global';

import { useMenuShadowContext } from '@components/providers/MenuShadow';
import { Alert, AlertType } from '@components/Alert';

import createPostStyles from '@styles/pages/create-post.module.css';
import { colorScheme } from '@styles/colors';
import Loading from '@components/Loading';
import { DisplayStringImage } from '@components/DisplayImage';



export default function Create({ freeMonths, draftedPost }: { freeMonths: number, draftedPost: Post }) {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [title, setTitle] = useState<string>(draftedPost.title);
    const [description, setDescription] = useState<string>(draftedPost.description);
    const [category, setCategory] = useState<string>(draftedPost.category);
    const [size, setSize] = useState<string>(draftedPost.size);
    const [gender, setGender] = useState<string>(draftedPost.gender);
    const [price, setPrice] = useState<number>(Number(draftedPost.price));
    const [images, setImages] = useState<string[]>(draftedPost.images);
    const [months, setMonths] = useState<number>(Number(draftedPost.duration));
    const [userFreeMonths, setUserFreeMonths] = useState<number>(0);


    const getData = () => {
        const postData = new FormData();
        postData.set('title', title);
        postData.set('description', description);
        postData.set('category', category);
        postData.set('size', size);
        postData.set('gender', gender);
        postData.set('price', String(price));
        for (let i=0; i<images.length; i++) postData.append('images', images[i]);
        postData.set('months', String(months));
        postData.set('userFreeMonths', String(userFreeMonths));
        return postData;
    }

    const setCategoryField = (value: string) => {
        if (NO_SIZE_GENDER_CATEGORIES.includes(value)) {
            setSize('');
            setGender('Unisex');
        } else if (NO_SIZE_GENDER_CATEGORIES.includes(category) && NO_SIZE_GENDER_CATEGORIES.includes(value)) {
            setSize(CLOTHING_SIZES[0]);
            setGender('Unisex');
        }
        setCategory(value);
    }

    const attemptFreePost = async () => {
        setLoading(true);
        const postData = getData();
        const res = await fetch(`/create/free/postId/api/`, {
            method: 'POST',
            body: postData
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            router.push(`/create/free/${resJson.postId}`);
        }
        else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    const attemptPaidPost = async () => {
        setLoading(true);
        const postData = getData();
        const res = await fetch(`/create/paid/postId/api/`, {
            method: 'POST',
            body: postData
        });

        const resJson = await res.json();
        if (resJson.cStatus==200) {
            router.push(`/create/paid/${resJson.postId}`);
        }
        else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    return (
        <div className={createPostStyles.form}>
            {loading ? 
                <Loading />
            :
            <>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {alert && <Alert alert={alert} variations={[]} />}
                </div>

                <h2 className={createPostStyles.title}>Create a Post</h2>

                <div className={createPostStyles.formItem}>
                    <h4>Title</h4>
                    <input type='text' placeholder='Post title' value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>

                <div className={createPostStyles.formItem}>
                    <h4>Description</h4>
                    <textarea placeholder='Describe your item' value={description} onChange={(e)=>setDescription(e.target.value)} />
                </div>

                <div className={createPostStyles.formItem}>
                    <h4>Category</h4>
                    <select value={category} onChange={(e)=>setCategoryField(e.target.value)}>
                        {CATEGORIES.map((cat, i) => (
                            <option key={i} value={cat.link}>{cat.title}</option>
                        ))}
                    </select>
                </div>
            
                {!NO_SIZE_GENDER_CATEGORIES.includes(category) &&
                    <div className={createPostStyles.formItem}>
                        <h4>Size</h4>
                        <select value={size} onChange={(e)=>setSize(e.target.value)}>
                            {CLOTHING_SIZES.map((size, i) => (
                                <option key={i} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                }

                {!NO_SIZE_GENDER_CATEGORIES.includes(category) &&
                    <div className={createPostStyles.formItem}>
                        <h4>Gender</h4>
                        <select value={gender} onChange={(e)=>setGender(e.target.value)}>
                            {GENDERS.map((gender, i) => (
                                <option key={i} value={gender}>{gender}</option>
                            ))}
                        </select>
                    </div>
                }

                <div className={createPostStyles.formItem}>
                    <h4>Price</h4>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                        <h4>$</h4>
                        <input type='number' placeholder='0.01' min='0.00' step='0.01' max='9999.99' value={price} onChange={(e)=>setPrice(Number(e.target.value))} />
                    </div>
                </div>

                <Images value={images} setValue={setImages} postId={draftedPost.id} />

                <ListingPeriod months={months} setMonths={setMonths} />

                {freeMonths!=0 && <UseFreeMonths userFreeMonths={userFreeMonths} setUserFreeMonths={setUserFreeMonths} freeMonths={freeMonths} />}

                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '10px'}}>
                    {months<=userFreeMonths && <button onClick={attemptFreePost}>Create Post (Use {months} free {months==1 ? 'month' : 'months'})</button>}
                    {months>userFreeMonths && <button onClick={attemptPaidPost}>Create Post (Pay ${months-userFreeMonths})</button>}
                </div>
            </>}
        </div>
    );
}





export function Images({ value, setValue, postId }: { value: any, setValue: (v: any)=>void, postId: string }) {
    const msContext = useMenuShadowContext();
    const imgRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    console.log("value ", value)


    const handleUpload = async (img: File | undefined) => {
        if (value.length >= 5 || img==undefined) return;


        const res = await fetch(`/api`, {
            method: 'POST',
            body: JSON.stringify({ postId, fileType: img.type, fileSize: img.size }),
            headers: { 'Content-Type': 'application/json' }
        });

        const resJson = await res.json();
        if (resJson.cStatus==200) {
            const ee = await fetch(resJson.signedUrl, {
                method: 'PUT',
                body: img,
                headers: { 'Content-Type': img.type },
            });
        }
        const newImages = [...value, resJson.key];
        setValue(newImages);
        if (imgRef.current) imgRef.current.value = '';
    };

    const handleDelete = async (idx: number) => {
        setLoading(true);
        const newImages = [...value];
        const deletedImg = newImages.splice(idx, 1)[0];
        
        const resDelete = await fetch(`/api`, {
            method: 'DELETE',
            body: JSON.stringify({ deletedImg, postId }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resDeleteJson = await resDelete.json();
        console.log("resDeleteJson C: ", resDeleteJson)
        setValue(newImages);
        setLoading(false);
    }

    const openImage = (idx: number) => {
        msContext.setContent(<DisplayStringImage img={value[idx]} />);
        msContext.openMenu();
    }

    return (
        <div className={createPostStyles.formItem} style={{width: '100%'}}>
            <h4>Images</h4>

            {loading ?
                <Loading />
            :
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px'}}>
                {value.map((img: any, i: any) => (
                    <div key={i} className={createPostStyles.imgWrapper}>
                        <BsFillDashCircleFill onClick={() => handleDelete(i)} size={20} color={colorScheme.red} className={createPostStyles.imgDelete} />
                        <img src={imgUrl(img)} onClick={() => openImage(i)} />
                    </div>
                ))}

                {value.length<5 && <>
                    <BsPlusCircle onClick={(e: React.MouseEvent<SVGElement>) => imgRef.current?.click()} size={35} color={colorScheme.orangePrimary} style={{ cursor: 'pointer'}} />
                    <input ref={imgRef} type='file' accept={IMG_ACCEPTED_FILES} onChange={(e) => handleUpload(e.target.files?.[0])} style={{display: 'none'}} />
                </>}
            </div>
        }
        </div>
    );
}



// function DisplayImage({ img }: { img: File }) {
//     return (
//         <div style={{ position: 'relative', width: '180px', height: '315px', backgroundColor: 'black' }} >
//             <img src={URL.createObjectURL(img)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
//         </div>
//     );
// }







function ListingPeriod({ months, setMonths }: { months: number, setMonths: React.Dispatch<React.SetStateAction<number>> }) {
    const [expires, setExpires] = useState<Date>(new Date(Date.now() + MONTH_TO_MILLI));

    const calcExpiration = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonths = Number(e.target.value);
        const offset = newMonths * MONTH_TO_MILLI;
        const expiration = new Date(Date.now() + offset);
        setExpires(expiration);
        setMonths(newMonths);
    }

    return (
        <div className={createPostStyles.formItem}>
            <h4>Listing Period</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <input type='number' min='1' step='1' max='10' style={{width: 'fit-content'}} value={months} onChange={calcExpiration} />
                <h4>{months==1 ? 'month' : 'months'}</h4>
            </div>
            
            <h5 className={createPostStyles.subText}>Post will expire {formatDate(expires)}</h5>
        </div>
    );
}





function UseFreeMonths({ userFreeMonths, setUserFreeMonths, freeMonths }: { userFreeMonths: number, setUserFreeMonths: React.Dispatch<React.SetStateAction<number>>, freeMonths: number }) {
    const max = 10 < freeMonths ? 10 : freeMonths;

    const updateNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFreeMonths(Number(e.target.value))
    }
    
    return (
        <div className={createPostStyles.formItem}>
            <h4>Free Months</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <h4>Use</h4>
                <input type='number' min='0' step='1' max={max} style={{width: 'fit-content'}} value={userFreeMonths} onChange={updateNumber} />
                <h4>free {userFreeMonths==1 ? 'month' : 'months'}</h4>
            </div>
            
            <h5 className={createPostStyles.subText}>You have {freeMonths} free {freeMonths==1 ? 'month' : 'months'} left.</h5>
        </div>
    );
}