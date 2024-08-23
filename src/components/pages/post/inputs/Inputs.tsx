import { useRef, useState } from 'react';

import { BsPlusCircle, BsFillDashCircleFill } from 'react-icons/bs';

import { CATEGORIES, CLOTHING_SIZES, GENDERS, IMG_ACCEPTED_FILES, MONTH_TO_MILLI, formatDate, imgUrl } from '@util/global';

import { useMenuShadowContext } from '@components/providers/MenuShadow';

import createPostStyles from '@styles/pages/create-post.module.css';
import { colorScheme } from '@styles/colors';
import DisplayImage from '@components/DisplayImage';
import { LoadingIconBlack } from '@components/Loading';
import { Alert, AlertType } from '@components/Alert';



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



export function Images({ value, setValue, postId }: { value: any, setValue: (v: any)=>void, postId: string }) {
    const msContext = useMenuShadowContext();
    const imgRef = useRef<HTMLInputElement | null>(null);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);


    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const img = e.target.files?.[0];
        setLoading(true);
        if (value.length >= 5 || img==undefined) return;
        const res = await fetch(`/api`, {
            method: 'POST',
            body: JSON.stringify({ postId, fileType: img.type, fileSize: img.size }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resJson = await res.json();
        if (resJson.cStatus==200) {
            await fetch(resJson.signedUrl, {
                method: 'PUT',
                body: img,
                headers: { 'Content-Type': img.type },
            });
            const newImages = [...value, resJson.key];
            setValue(newImages);
            setAlert(null);
        } else {
            setAlert(resJson);
        }
        if (imgRef.current) imgRef.current.value = '';
        setLoading(false);
    };


    const handleDelete = async (idx: number) => {
        setLoading(true);
        const newImages = [...value];
        const deletedImgKey = newImages.splice(idx, 1)[0];
        await fetch(`/api`, {
            method: 'DELETE',
            body: JSON.stringify({ deletedImgKey, postId }),
            headers: { 'Content-Type': 'application/json' }
        });
        setValue(newImages);
        setLoading(false);
    }

    const openImage = (idx: number) => {
        msContext.setContent(<DisplayImage img={value[idx]} />);
        msContext.openMenu();
    }

    return (
        <div className={createPostStyles.formItem} style={{width: '100%'}}>
            <h4>Images</h4>

            {loading ?
                <LoadingIconBlack />
            :
            <>
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
                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                    {alert && <Alert alert={alert} variations={[]} />}
                </div>
            </>
            }
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
    const [inputValue, setInputValue] = useState<string>(value !== '' ? value.toString() : '');

    // const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     e.preventDefault();
    //     const val = Number(e.target.value);
    //     setValue((max < val) ? max : val);
    // }
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const val = e.target.value;
        if (val === '') {
            setInputValue(val);  // keep the input value as an empty string
            setValue('');        // keep the value as an empty string to denote no selection
        } else {
            const numVal = Number(val);
            setInputValue(val);
            setValue((max < numVal) ? max : numVal);
        }
    }

    const maxValue = value === '' ? '' : value;
    
    return (
        <div className={createPostStyles.formItem}>
            <h4>Free Months</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <h4>Use</h4>
                <input type='number' placeholder='0' min='0' step='1' max={max} style={{width: 'fit-content'}} value={inputValue} onChange={handleInput} />
                <h4>free {maxValue === '1' ? 'month' : 'months'}</h4>
            </div>
            
            <h5 className={createPostStyles.subText}>You have {freeMonths} free {freeMonths==1 ? 'month' : 'months'} left.</h5>
        </div>
    );
}