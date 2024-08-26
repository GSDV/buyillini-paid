import { useState } from 'react';

import { Category, Description, Gender, Images, Price, Size, SuperListingPeriod, Title } from './inputs/Inputs';
import Loading from '@components/Loading';

import { CATEGORIES, CLOTHING_SIZES, GENDERS, NO_SIZE_GENDER_CATEGORIES } from '@util/global';

import createPostStyles from '@styles/pages/create-post.module.css';
import { Post } from '@prisma/client';
import { makePostPicture } from '@util/photos/crop';



export default function CreateSuperPost() {
    const [loading, setLoading] = useState<boolean>(false);

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [size, setSize] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [images, setImages] = useState<File[]>([]);
    const [duration, setDuration] = useState<string>('');


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
        }
        return inputData;
    }

    const uploadImages = async () => {
        const imageKeys: string[] = [];
        for (let i=0; i<images.length; i++) {
            const imageFile = images[i];

            const [resSignAndKey, croppedPostBlob] = await Promise.all([
                fetch(`/api/s3`, {
                    method: 'POST',
                    body: JSON.stringify({ operation: 'UPLOAD_POST_PHOTO', fileType: imageFile.type, fileSize: imageFile.size }),
                    headers: { 'Content-Type': 'application/json' }
                }),
                makePostPicture(imageFile)
            ]);

            if (croppedPostBlob == null) {
                // setAlert({cStatus: 400, msg: 'Something went wrong.'});
                return;
            }

            const resSignAndKeyJson = await resSignAndKey.json();
            if (resSignAndKeyJson.cStatus==200) {
                await fetch(resSignAndKeyJson.signedUrl, {
                    method: 'PUT',
                    body: croppedPostBlob,
                    headers: { 'Content-Type': 'webp' }
                });
                imageKeys.push(resSignAndKeyJson.key);
            } else {
                // setAlert(resSignAndKeyJson);/
                return;
            }
        }
        return imageKeys;
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
        // action(postData);
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

                <SuperListingPeriod value={duration} setValue={setDuration} />

                <button onClick={attemptSuperPost}>Create</button>
            </>}
        </div>
    );
}