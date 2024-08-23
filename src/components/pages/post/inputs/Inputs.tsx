import { useRef, useState } from 'react';

import { BsPlusCircle, BsFillDashCircleFill } from 'react-icons/bs';

import { CATEGORIES, CLOTHING_SIZES, GENDERS, IMG_ACCEPTED_FILES, MONTH_TO_MILLI, formatDate, imgUrl } from '@util/global';

import { useMenuShadowContext } from '@components/providers/MenuShadow';

import createPostStyles from '@styles/pages/create-post.module.css';
import { colorScheme } from '@styles/colors';
import { DisplayFileImage } from '@components/DisplayImage';



interface InputValue {
    value: any,
    setValue: (v: any) => void
}



export function Title({ value, setValue }: InputValue) {
    return (
        <div className={createPostStyles.formItem}>
            <h4>Title</h4>
            <input type='text' placeholder='Post title' value={value} onChange={(e)=>setValue(e.target.value)} />
        </div>
    );
}



export function Description({ value, setValue }: InputValue) {
    return (
        <div className={createPostStyles.formItem}>
            <h4>Description</h4>
            <textarea placeholder='Describe your item' value={value} onChange={(e)=>setValue(e.target.value)} />
        </div>
    );
}



export function Category({ value, setValue }: InputValue) {
    return (
        <div className={createPostStyles.formItem}>
            <h4>Category</h4>
            <select value={value} onChange={(e)=>setValue(e.target.value)}>
                {CATEGORIES.map((cat, i) => (
                    <option key={i} value={cat.link}>{cat.title}</option>
                ))}
            </select>
        </div>
    );
}



export function Gender({ value, setValue }: InputValue) {
    return (
        <div className={createPostStyles.formItem}>
            <h4>Gender</h4>
            <select value={value} onChange={(e)=>setValue(e.target.value)}>
                {GENDERS.map((gender, i) => (
                    <option key={i} value={gender}>{gender}</option>
                ))}
            </select>
        </div>
    );
}



export function Size({ value, setValue }: InputValue) {
    return (
        <div className={createPostStyles.formItem}>
            <h4>Size</h4>
            <select value={value} onChange={(e)=>setValue(e.target.value)}>
                {CLOTHING_SIZES.map((size, i) => (
                    <option key={i} value={size}>{size}</option>
                ))}
            </select>
        </div>
    );
}



export function Price({ value, setValue }: InputValue) {
    return (
        <div className={createPostStyles.formItem}>
            <h4>Price</h4>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <h4>$</h4>
                <input type='number' min='0.00' step='0.01' max='9999.99' value={value} onChange={(e)=>setValue(Number(e.target.value))} />
            </div>
        </div>
    );
}



export function Images({ value, setValue }: InputValue) {
    const msContext = useMenuShadowContext();
    const imgRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = (img: File | undefined) => {
        if (value.length >= 5 || img==undefined) return;
        const newImages = [...value, img];
        setValue(newImages);
        if (imgRef.current) imgRef.current.value = '';
    };

    const handleDelete = (idx: number) => {
        const newImages = [...value];
        newImages.splice(idx, 1);
        setValue(newImages);
    }

    const openImage = (idx: number) => {
        msContext.setContent(<DisplayFileImage img={value[idx]} />);
        msContext.openMenu();
    }

    return (
        <div className={createPostStyles.formItem} style={{width: '100%'}}>
            <h4>Images</h4>

            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px'}}>
                {value.map((img: any, i: any) => (
                    <div key={i} className={createPostStyles.imgWrapper}>
                        <BsFillDashCircleFill onClick={() => handleDelete(i)} size={20} color={colorScheme.red} className={createPostStyles.imgDelete} />
                        <img src={URL.createObjectURL(img)} onClick={() => openImage(i)} />
                    </div>
                ))}

                {value.length<5 && <>
                    <BsPlusCircle onClick={(e: React.MouseEvent<SVGElement>) => imgRef.current?.click()} size={35} color={colorScheme.orangePrimary} style={{ cursor: 'pointer'}} />
                    <input ref={imgRef} type='file' accept={IMG_ACCEPTED_FILES} onChange={(e) => handleUpload(e.target.files?.[0])} style={{display: 'none'}} />
                </>}
            </div>
        </div>
    );
}


export function StringImages({ value, setValue }: InputValue) {
    const msContext = useMenuShadowContext();
    const imgRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setLoading(true);

        const img = e.target.files?.[0];
        if (value.length >= 5 || img==undefined) return;

        img.size


        try {
            const res = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileType: img.type, fileSize: img.size })
            });

            if (!res.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

        const { signedUrl } = await response.json();

        // Upload to S3
        await fetch(signedUrl, {
            method: 'PUT',
            body: img,
            headers: { 'Content-Type': img.type },
        });

      




        // const newImages = [...value, img];
        // setValue(newImages);
        // if (imgRef.current) imgRef.current.value = '';

        setLoading(false);
    };


    const handleDelete = (idx: number) => {
        const newImages = [...value];
        newImages.splice(idx, 1);
        setValue(newImages);
    }

    const openImage = (idx: number) => {
        msContext.setContent(<DisplayFileImage img={value[idx]} />);
        msContext.openMenu();
    }

    return (
        <div className={createPostStyles.formItem} style={{width: '100%'}}>
            <h4>Images</h4>

            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px'}}>
                {value.map((img: any, i: any) => (
                    <div key={i} className={createPostStyles.imgWrapper}>
                        <BsFillDashCircleFill onClick={() => handleDelete(i)} size={20} color={colorScheme.red} className={createPostStyles.imgDelete} />
                        <img src={imgUrl(img)} onClick={() => openImage(i)} />
                    </div>
                ))}

                {value.length<5 && <>
                    <BsPlusCircle onClick={(e: React.MouseEvent<SVGElement>) => imgRef.current?.click()} size={35} color={colorScheme.orangePrimary} style={{ cursor: 'pointer'}} />
                    <input ref={imgRef} type='file' accept={IMG_ACCEPTED_FILES} onChange={handleUpload} style={{display: 'none'}} />
                </>}
            </div>
        </div>
    );
}



export function ListingPeriod({ value, setValue }: InputValue) {
    const [expires, setExpires] = useState<Date>(new Date(Date.now() + MONTH_TO_MILLI));

    const calcExpiration = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonths = Number(e.target.value);
        const offset = newMonths * MONTH_TO_MILLI;
        const expiration = new Date(Date.now() + offset);
        setExpires(expiration);
        setValue(newMonths);
    }

    return (
        <div className={createPostStyles.formItem}>
            <h4>Listing Period</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <input type='number' min='1' step='1' max='10' style={{width: 'fit-content'}} value={value} onChange={calcExpiration} />
                <h4>{value==1 ? 'month' : 'months'}</h4>
            </div>
            
            <h5 className={createPostStyles.subText}>Post will expire {formatDate(expires)}</h5>
        </div>
    );
}



export function SuperListingPeriod({ value, setValue }: InputValue) {
    const [expires, setExpires] = useState<Date>(new Date(Date.now() + MONTH_TO_MILLI));

    const calcExpiration = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonths = Number(e.target.value);
        const offset = newMonths * MONTH_TO_MILLI;
        const expiration = new Date(Date.now() + offset);
        setExpires(expiration);
        setValue(newMonths);
    }

    return (
        <div className={createPostStyles.formItem}>
            <h4>Super Listing Period</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <input type='number' min='1' step='1' style={{width: '100px'}} value={value} onChange={calcExpiration} />
                <h4>{value==1 ? 'month' : 'months'}</h4>
            </div>
            
            <h5 className={createPostStyles.subText}>Post will expire {formatDate(expires)}</h5>
        </div>
    );
}



export function UseFreeMonths({ iv, freeMonths }: { iv: InputValue, freeMonths: number }) {
    const { value, setValue } = iv;
    const max = 10 < freeMonths ? 10 : freeMonths;
    
    return (
        <div className={createPostStyles.formItem}>
            <h4>Free Months</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <h4>Use</h4>
                <input type='number' min='0' step='1' max={max} style={{width: 'fit-content'}} value={value} onChange={(e)=>setValue(Number(e.target.value))} />
                <h4>free {value==1 ? 'month' : 'months'}</h4>
            </div>
            
            <h5 className={createPostStyles.subText}>You have {freeMonths} free {freeMonths==1 ? 'month' : 'months'} left.</h5>
        </div>
    );
}