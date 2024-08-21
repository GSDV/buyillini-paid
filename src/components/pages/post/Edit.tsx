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



export default function Edit({ post, postImages }: { post: Post, postImages: File[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [title, setTitle] = useState<string>(post.title);
    const [description, setDescription] = useState<string>(post.description);
    const [category, setCategory] = useState<string>(post.category);
    const [size, setSize] = useState<string>(post.size);
    const [gender, setGender] = useState<string>(post.gender);
    const [price, setPrice] = useState<number>(Number(post.price));
    const [images, setImages] = useState<File[]>(postImages);


    const getData = () => {
        const postData = new FormData();
        postData.set('title', title);
        postData.set('description', description);
        postData.set('category', category);
        postData.set('size', size);
        postData.set('gender', gender);
        postData.set('price', String(price));
        for (let i=0; i<images.length; i++) postData.append('images', images[i]);
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

    const attemptEditPost = async () => {
        setLoading(true);
        const postData = getData();
        const res = await fetch(`/post/${post.id}/edit/api/`, {
            method: 'POST',
            body: postData,
        });
        const resJson = await res.json();

        if (resJson.cStatus==200) {
            router.push(`/post/${post.id}`);
        } else {
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
                            <option key={i} value={cat.title}>{cat.title}</option>
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

                <button onClick={attemptEditPost}>Save Updates</button>
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