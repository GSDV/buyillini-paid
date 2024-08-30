'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Post } from '@prisma/client';
import { CLOTHING_SIZES, NO_SIZE_GENDER_CATEGORIES } from '@util/global';

import { Alert, AlertType } from '@components/Alert';

import createPostStyles from '@styles/pages/create-post.module.css';
import { CheckIfLoading } from '@components/Loading';
import { Category, Description, Gender, Images, Price, Size, Title } from './inputs/Inputs';
import { makePostPicture } from '@util/photos/crop';
import { urlToFile } from '@util/photos/urlToFile';
import { clientUploadImagesAndGetKeys } from '@util/photos/clientUpload';



export default function Edit({ post }: { post: Post }) {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [title, setTitle] = useState<string>(post.title);
    const [description, setDescription] = useState<string>(post.description);
    const [category, setCategory] = useState<string>(post.category);
    const [size, setSize] = useState<string>(post.size);
    const [gender, setGender] = useState<string>(post.gender);
    const [price, setPrice] = useState<number>(Number(post.price));
    const [images, setImages] = useState<File[]>([]);


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
            images: imageKeys
        }
        return inputData;
    }

    const setCategoryField = (value: string) => {
        if (NO_SIZE_GENDER_CATEGORIES.includes(value)) {
            setSize('');
            setGender('Unisex');
        } else if (NO_SIZE_GENDER_CATEGORIES.includes(category) && !NO_SIZE_GENDER_CATEGORIES.includes(value)) {
            setSize(CLOTHING_SIZES[0]);
            setGender('Unisex');
        }
        setCategory(value);
    }

    const attemptEditPost = async () => {
        setLoading(true);
        const inputData = await getData();
        if (inputData === null) return;

        const res = await fetch(`/post/${post.id}/edit/api/`, {
            method: 'PUT',
            body: JSON.stringify({ inputData }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            router.push(`/post/${post.id}`);
        } else {
            setAlert(resJson);
            setLoading(false);
        }
    }

    const convertImageKeysToFiles = async () => {
        setLoading(true);
        const urlsToFilesPromises = post.images.map(key => urlToFile(key));
        const imageFiles = await Promise.all(urlsToFilesPromises);
        const nullFileExists = imageFiles.some((file) => file==null);
        if (nullFileExists) {
            setAlert({ cStatus: 400, msg: `Something went wrong while fetching past images.` });
        } else {
            setImages(imageFiles as any);
        }
        setLoading(false);
    }

    useEffect(() => {
        convertImageKeysToFiles();
    }, []);

    return (
        <div className={createPostStyles.form}>
            <CheckIfLoading loading={loading} content={
                <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {alert && <Alert alert={alert}  />}
                    </div>

                    <h2 className={createPostStyles.title}>Edit Post</h2>

                    <Title value={title} setValue={setTitle} />

                    <Description value={description} setValue={setDescription} />

                    <Category value={category} setValue={setCategoryField} />

                    {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Size value={size} setValue={setSize} /> }

                    {!NO_SIZE_GENDER_CATEGORIES.includes(category) && <Gender value={gender} setValue={setGender} /> }
                    
                    <Price value={price} setValue={setPrice} />

                    <Images value={images} setValue={setImages} />

                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '10px'}}>
                        <button onClick={attemptEditPost}>Save Updates</button>
                    </div>
                </>
            } />
        </div>
    );
}

