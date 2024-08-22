import { useState } from 'react';

import { Category, Description, Gender, Images, Price, Size, SuperListingPeriod, Title } from './inputs/Inputs';
import Loading from '@components/Loading';

import { CATEGORIES, CLOTHING_SIZES, GENDERS, NO_SIZE_GENDER_CATEGORIES } from '@util/global';

import createPostStyles from '@styles/pages/create-post.module.css';



export default function CreateSuperPost({ action }: { action: (data: FormData)=>void }) {
    const [loading, setLoading] = useState<boolean>(false);

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>(CATEGORIES[0].link);
    const [size, setSize] = useState<string>(CLOTHING_SIZES[0]);
    const [gender, setGender] = useState<string>(GENDERS[0]);
    const [price, setPrice] = useState<number>(0.00);
    const [images, setImages] = useState<File[]>([]);
    const [months, setMonths] = useState<number>(1);


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

                <Images value={images} setValue={setImages} />

                <SuperListingPeriod value={months} setValue={setMonths} />


                {/* <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '10px'}}>
                    {months<=userFreeMonths && <button onClick={attemptFreePost}>Create Post (Use {months} free {months==1 ? 'month' : 'months'})</button>}
                </div> */}
                <button onClick={attemptSuperPost}>Create</button>
            </>}
        </div>
    );
}