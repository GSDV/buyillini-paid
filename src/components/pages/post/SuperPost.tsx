import { useState } from 'react';

import { Category, Description, Gender, Images, Price, Size, SuperListingPeriod, Title } from './inputs/Inputs';
import Loading from '@components/Loading';

import { CATEGORIES, CLOTHING_SIZES, GENDERS, NO_SIZE_GENDER_CATEGORIES } from '@util/global';

import createPostStyles from '@styles/pages/create-post.module.css';
import { Post } from '@prisma/client';



export default function CreateSuperPost({ draftedPost }: { draftedPost: Post }) {
    const [loading, setLoading] = useState<boolean>(false);

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [size, setSize] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [price, setPrice] = useState<number>(Number(0.00));
    const [images, setImages] = useState<File[]>([]);
    const [duration, setDuration] = useState<number>(Number(0));


    const getData = async () => {
        const imageKeys = await uploadImages();
        const inputData = {
            title,
            description,
            category,
            size,
            gender,
            price: String(price),
            images: imageKeys,
            duration: (duration=='' ? '1': duration),
            freeMonthsUsed: (freeMonthsUsed=='' ? '0' : freeMonthsUsed)
        }
        return inputData;
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