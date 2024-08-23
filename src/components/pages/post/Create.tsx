'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Post } from '@prisma/client';
import { CATEGORIES, CLOTHING_SIZES, GENDERS, MONTH_TO_MILLI, NO_SIZE_GENDER_CATEGORIES, formatDate } from '@util/global';

import { Alert, AlertType } from '@components/Alert';

import createPostStyles from '@styles/pages/create-post.module.css';
import Loading from '@components/Loading';
import { Category, Description, Gender, Images, ListingPeriod, Price, Size, Title, UseFreeMonths } from './inputs/Inputs';



export default function Create({ draftedPost, freeMonths }: { draftedPost: Post, freeMonths: number }) {
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
    const [userFreeMonths, setUserFreeMonths] = useState<string>('0');
    // const [userFreeMonths, setUserFreeMonths] = useState<number>(0);


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
        postData.set('userFreeMonths', (userFreeMonths=='' ? '0' : userFreeMonths));
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

                <Title value={title} setValue={setTitle} />

                <Description value={description} setValue={setDescription} />

                <Category value={category} setValue={setCategoryField} />

                {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Size value={size} setValue={setSize} /> }

                {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Gender value={gender} setValue={setGender} /> }

                <Price value={price} setValue={setPrice} />

                <Images value={images} setValue={setImages} postId={draftedPost.id} />

                <ListingPeriod value={months} setValue={setMonths} />

                {freeMonths!=0 && <UseFreeMonths iv={{value: userFreeMonths, setValue: setUserFreeMonths}} freeMonths={freeMonths} />}

                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '10px'}}>
                    {months<=Number(userFreeMonths) && <button onClick={attemptFreePost}>Create Post (Use {months} free {months==1 ? 'month' : 'months'})</button>}
                    {months>Number(userFreeMonths) && <button onClick={attemptPaidPost}>Create Post (Pay ${months-Number(userFreeMonths)})</button>}
                </div>
            </>}
        </div>
    );
}