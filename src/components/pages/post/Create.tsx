import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { BsPlusCircle, BsFillDashCircleFill } from 'react-icons/bs';

import { Post } from '@prisma/client';
import { CATEGORIES, CLOTHING_SIZES, GENDERS, IMG_ACCEPTED_FILES, MONTH_TO_MILLI, formatDate } from '@util/global';

import { useMenuShadowContext } from '@components/providers/MenuShadow';
import { Alert, AlertType } from '@components/Alert';

import createPostStyles from '@styles/pages/create-post.module.css';
import { colorScheme } from '@styles/colors';
import Loading from '@components/Loading';



export default function Create({ freeMonths, pastPost, pastImages }: { freeMonths: number, pastPost: Post | null, pastImages: File[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [title, setTitle] = useState<string>(!pastPost ? '' : pastPost.title);
    const [description, setDescription] = useState<string>(!pastPost ? '' : pastPost.description);
    const [category, setCategory] = useState<string>(!pastPost ? CATEGORIES[0].link : pastPost.category);
    const [size, setSize] = useState<string>(!pastPost ? CLOTHING_SIZES[0] : pastPost.size);
    const [gender, setGender] = useState<string>(!pastPost ? GENDERS[0] : pastPost.gender);
    const [price, setPrice] = useState<number>(!pastPost ? 0.00 : Number(pastPost.price));
    const [images, setImages] = useState<File[]>(pastImages);
    const [months, setMonths] = useState<number>(!pastPost ? 1 : pastPost.duration);
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
        if (value=='other') {
            setSize('');
            setGender('Unisex');
        } else if (category=='other' && value!='other') {
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
        if (resJson.cStatus==200) router.push(`/create/free/${resJson.postId}`);
        setAlert(resJson);
        setLoading(false);
    }

    const attemptPaidPost = async () => {
        setLoading(true);
        const postData = getData();
        const res = await fetch(`/create/paid/postId/api/`, {
            method: 'POST',
            body: postData
        });

        const resJson = await res.json();
        if (resJson.cStatus==200) router.push(`/create/paid/${resJson.postId}`);
        setLoading(false);
        setAlert(resJson)
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

                {category!='other' &&
                    <div className={createPostStyles.formItem}>
                        <h4>Size</h4>
                        <select value={size} onChange={(e)=>setSize(e.target.value)}>
                            {CLOTHING_SIZES.map((size, i) => (
                                <option key={i} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                }

                {category!='other' &&
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

                <Images images={images} setImages={setImages} />

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





function Images({ images, setImages }: { images: File[], setImages: React.Dispatch<React.SetStateAction<File[]>>}) {
    const msContext = useMenuShadowContext();
    const imgRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = (img: File | undefined) => {
        if (images.length >= 5 || img==undefined) return;
        const newImages = [...images, img];
        setImages(newImages);
        if (imgRef.current) imgRef.current.value = '';
    };

    const handleDelete = (idx: number) => {
        const newImages = [...images];
        newImages.splice(idx, 1);
        setImages(newImages);
    }

    const openImage = (idx: number) => {
        msContext.setContent(<DisplayImage img={images[idx]} />);
        msContext.openMenu();
    }

    return (
            <div className={createPostStyles.formItem} style={{width: '100%'}}>
                <h4>Images</h4>

                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px'}}>
                    {images.map((img, i) => (
                        <div key={i} className={createPostStyles.imgWrapper}>
                            <BsFillDashCircleFill onClick={() => handleDelete(i)} size={20} color={colorScheme.red} className={createPostStyles.imgDelete} />
                            <img src={URL.createObjectURL(img)} onClick={() => openImage(i)} />
                        </div>
                    ))}

                    {images.length<5 &&
                        <>
                            <BsPlusCircle onClick={(e: React.MouseEvent<SVGElement>) => imgRef.current?.click()} size={35} color={colorScheme.orangePrimary} style={{ cursor: 'pointer'}} />
                            <input ref={imgRef} type='file' accept={IMG_ACCEPTED_FILES} onChange={(e) => handleUpload(e.target.files?.[0])} style={{display: 'none'}} />
                        </>
                    }
                </div>

            </div>
    );
}

function DisplayImage({ img }: { img: File }) {
    return (
        <div style={{ position: 'relative', width: '180px', height: '315px', backgroundColor: 'black' }} >
            <img src={URL.createObjectURL(img)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
}







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