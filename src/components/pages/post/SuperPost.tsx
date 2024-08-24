import { useState } from 'react';

import { Category, Description, Gender, Images, Price, Size, SuperListingPeriod, Title } from './inputs/Inputs';
import Loading from '@components/Loading';

import { CATEGORIES, CLOTHING_SIZES, GENDERS, NO_SIZE_GENDER_CATEGORIES } from '@util/global';

import createPostStyles from '@styles/pages/create-post.module.css';
import { Post } from '@prisma/client';



export default function CreateSuperPost({ draftedPost, action }: { draftedPost: Post, action: (data: FormData)=>void }) {
    const [loading, setLoading] = useState<boolean>(false);

    const [title, setTitle] = useState<string>(draftedPost.title);
    const [description, setDescription] = useState<string>(draftedPost.description);
    const [category, setCategory] = useState<string>(draftedPost.category);
    const [size, setSize] = useState<string>(draftedPost.size);
    const [gender, setGender] = useState<string>(draftedPost.gender);
    const [price, setPrice] = useState<number>(Number(draftedPost.price));
    const [images, setImages] = useState<string[]>(draftedPost.images);
    const [months, setMonths] = useState<number>(Number(draftedPost.duration));


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

    const attemptSuperPost = async () => {
        setLoading(true);
        const postData = getData();
        action(postData);
        setLoading(false);
    }


    return (
        <div className={createPostStyles.form}>
            {loading ? 
                <Loading />
            :
            <>
                <Title value={title} setValue={setTitle} />

                <Description value={description} setValue={setDescription} />

                <Category value={category} setValue={setCategoryField} />

                {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Size value={size} setValue={setSize} />}

                {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Gender value={gender} setValue={setGender} />}

                <Price value={price} setValue={setPrice} />

                {/* <Images value={images} setValue={setImages} postId={draftedPost.id} /> */}

                <SuperListingPeriod value={months} setValue={setMonths} />

                <button onClick={attemptSuperPost}>Create</button>
            </>}
        </div>
    );
}