'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Post } from '@prisma/client';
import { CLOTHING_SIZES, NO_SIZE_GENDER_CATEGORIES } from '@util/global';

import { Alert, AlertType } from '@components/Alert';

import createPostStyles from '@styles/pages/create-post.module.css';
import Loading from '@components/Loading';
import { Category, Description, Images, Gender, ListingPeriod, Price, Size, Title, UseFreeMonths } from './inputs/Inputs';
import { makePostPicture } from '@util/photos/crop';
import { urlToFile } from '@util/photos/urlToFile';



export default function Create({ draftedPost, freeMonths }: { draftedPost: Post, freeMonths: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const [title, setTitle] = useState<string>(draftedPost.title);
    const [description, setDescription] = useState<string>(draftedPost.description);
    const [category, setCategory] = useState<string>(draftedPost.category);
    const [size, setSize] = useState<string>(draftedPost.size);
    const [gender, setGender] = useState<string>(draftedPost.gender);
    const [price, setPrice] = useState<number>(Number(draftedPost.price));
    const [images, setImages] = useState<File[]>([]);
    const [months, setMonths] = useState<string>(draftedPost.duration.toString());
    const [freeMonthsUsed, setFreeMonthsUsed] = useState<string>('0');


    const getData = async () => {
        const imageKeys = await uploadImages();
        const postData = {
            title: title,
            description: description,
            category: category,
            size: size,
            gender: gender,
            price: String(price),
            images: imageKeys,
            months: (months=='' ? '1': months),
            freeMonthsUsed: (freeMonthsUsed=='' ? '0' : freeMonthsUsed)
        }
        return postData;
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
            console.log("BB")

            if (croppedPostBlob == null) {
                setAlert({cStatus: 400, msg: 'Something went wrong.'});
                return;
            }

            const resSignAndKeyJson = await resSignAndKey.json();
            if (resSignAndKeyJson.cStatus==200) {
                await fetch(resSignAndKeyJson.signedUrl, {
                    method: 'POST',
                    body: croppedPostBlob,
                    headers: { 'Content-Type': 'webp' },
                    mode: 'no-cors'
                });
                imageKeys.push(resSignAndKeyJson.key);
            } else {
                setAlert(resSignAndKeyJson);
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


    const attemptFreePost = async () => {
        setLoading(true);
        console.log("AA")
        const postData = await getData();
        console.log("CC")
        const res = await fetch(`/create/postId/api/free`, {
            method: 'POST',
            body: JSON.stringify({ postData }),
            headers: { 'Content-Type': 'application/json' }
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
        const postData = await getData();
        const res = await fetch(`/create/postId/api/paid`, {
            method: 'POST',
            body: JSON.stringify({ postData }),
            headers: { 'Content-Type': 'application/json' }
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


    const convertImageKeysToFiles = async () => {
        setLoading(true);
        const urlsToFilesPromises = draftedPost.images.map(key => urlToFile(key));
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

                <Images value={images} setValue={setImages} />

                <ListingPeriod value={months} setValue={setMonths} />

                {freeMonths!=0 && <UseFreeMonths iv={{value: freeMonthsUsed, setValue: setFreeMonthsUsed}} freeMonths={freeMonths} />}

                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '10px'}}>
                    {numMonths(months) <= numFreeMonths(freeMonthsUsed) && <button onClick={attemptFreePost}>Create Post (Use {months} free {numFreeMonths(months)==1 ? 'month' : 'months'})</button>}
                    {numMonths(months) > numFreeMonths(freeMonthsUsed) && <button onClick={attemptPaidPost}>Create Post (Pay ${numMonths(months)-numFreeMonths(freeMonthsUsed)})</button>}
                </div>
            </>}
        </div>
    );
}


function numMonths(months: string) {
    return (months==='') ? 1 : Number(months);
}

function numFreeMonths(freeMonthsUsed: string) {
    return (freeMonthsUsed==='') ? 0 : Number(freeMonthsUsed);
}