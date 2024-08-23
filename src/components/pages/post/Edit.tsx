import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { BsPlusCircle, BsFillDashCircleFill } from 'react-icons/bs';

import { Post } from '@prisma/client';
import { CATEGORIES, CLOTHING_SIZES, GENDERS, IMG_ACCEPTED_FILES, MONTH_TO_MILLI, NO_SIZE_GENDER_CATEGORIES, formatDate } from '@util/global';

import { useMenuShadowContext } from '@components/providers/MenuShadow';
import { Alert, AlertType } from '@components/Alert';

import createPostStyles from '@styles/pages/create-post.module.css';
import { colorScheme } from '@styles/colors';
import Loading from '@components/Loading';
import { Category, Description, Gender, Images, Price, Size, Title } from './inputs/Inputs';



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
        if (NO_SIZE_GENDER_CATEGORIES.includes(value)) {
            setSize('');
            setGender('Unisex');
        } else if (NO_SIZE_GENDER_CATEGORIES.includes(category) && NO_SIZE_GENDER_CATEGORIES.includes(value)) {
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

                <h2 className={createPostStyles.title}>Edit Post</h2>

                <Title value={title} setValue={setTitle} />

                <Description value={description} setValue={setDescription} />

                <Category value={category} setValue={setCategoryField} />

                {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Size value={size} setValue={setSize} /> }

                {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Gender value={gender} setValue={setGender} /> }
                
                <Price value={price} setValue={setPrice} />

                <Images value={images} setValue={setImages} postId={post.id} />

                <button onClick={attemptEditPost}>Save Updates</button>
            </>}
        </div>
    );
}

