import { useState } from 'react';

import { Category, Description, Gender, Images, Price, Size, SuperListingPeriod, Title } from './inputs/Inputs';
import { CheckIfLoading } from '@components/Loading';

import { CATEGORIES, CLOTHING_SIZES, GENDERS, NO_SIZE_GENDER_CATEGORIES, isRegCat } from '@util/global';

import createPostStyles from '@styles/pages/create-post.module.css';
import { Alert, AlertType } from '@components/Alert';
import Link from 'next/link';
import { clientUploadImagesAndGetKeys } from '@util/photos/clientUpload';



export default function CreateSuperPost() {
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [postId, setPostId] = useState<string>('');


    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>(CATEGORIES[0].link);
    const [size, setSize] = useState<string>(CLOTHING_SIZES[0]);
    const [gender, setGender] = useState<string>(GENDERS[0]);
    const [price, setPrice] = useState<string>('');
    const [images, setImages] = useState<File[]>([]);
    const [duration, setDuration] = useState<string>('');


    const getData = async () => {
        const imageKeys = await clientUploadImagesAndGetKeys(images);
        if (imageKeys === null) {
            setAlert({cStatus: 400, msg: 'Something went wrong.'});
            return null;
        }
        const inputData = {
            title,
            description,
            category,
            size,
            gender,
            price: String(price),
            images: imageKeys,
            duration: (duration=='' ? '1': duration),
        }
        return inputData;
    }

    const setCategoryField = (value: string) => {
        if (!isRegCat(value)) {
            setSize('');
            setGender('Unisex');
        } else if (!isRegCat(category) && isRegCat(value)) {
            setSize(CLOTHING_SIZES[0]);
            setGender('Unisex');
        }
        setCategory(value);
    }

    const attemptSuperPost = async () => {
        setLoading(true);
        const inputData = await getData();
        if (inputData === null) return;

        const res = await fetch(`/admin/posts/super/api`, {
            method: 'POST',
            body: JSON.stringify({ inputData }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) setPostId(resJson.postId);
        setAlert(resJson);
        setLoading(false);
    }


    return (
        <div className={createPostStyles.form}>
            <CheckIfLoading loading={loading} content={
                <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {alert && <Alert alert={alert}  />}
                    </div>

                    {postId!='' && <h4><b>LINK: </b> <Link href={postId}>postId</Link></h4>}
                    <h3>Create Super Post</h3>

                    <Title value={title} setValue={setTitle} />

                    <Description value={description} setValue={setDescription} />

                    <Category value={category} setValue={setCategoryField} />

                    {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Size value={size} setValue={setSize} />}

                    {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Gender value={gender} setValue={setGender} />}

                    <Price value={price} setValue={setPrice} />

                    <Images value={images} setValue={setImages} />

                    <SuperListingPeriod value={duration} setValue={setDuration} />

                    <button onClick={attemptSuperPost}>Create</button>
                </>
            } />
        </div>
    );
}