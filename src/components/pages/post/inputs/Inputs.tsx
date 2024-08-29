import { useEffect, useRef, useState } from 'react';

import { BsPlusCircle, BsFillDashCircleFill } from 'react-icons/bs';

import { ACCEPTED_FILES, CATEGORIES, CLOTHING_SIZES, GENDERS, IMG_ACCEPTED_FILES, IMG_SIZE_LIMIT, IMG_SIZE_LIMIT_TXT, MAX_LISTING_PERIOD, MONTH_TO_MILLI, formatDate, imgUrl } from '@util/global';

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



export function Images({ value, setValue }: InputValue) {
    const msContext = useMenuShadowContext();
    const imgRef = useRef<HTMLInputElement | null>(null);
    const [tempUrls, setTempUrls] = useState<string[]>([]);
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files?.[0];
        if (value.length >= 5 || image==undefined) return;
        if (!ACCEPTED_FILES.includes(image.type)) {
            setAlert({cStatus: 102, msg: `Please upload a png, jpg, or webp file.`});
            return;
        }
        if (image.size > IMG_SIZE_LIMIT) {
            setAlert({cStatus: 102, msg: `Please upload an image smaller than ${IMG_SIZE_LIMIT_TXT}.`});
            return;
        }
        const newImages = [...value, image];
        setValue(newImages);
        setAlert(null);

        setTempUrls([...tempUrls, URL.createObjectURL(image)]);

        if (imgRef.current) imgRef.current.value = '';
        setLoading(false);
    }


    const handleDelete = async (idx: number) => {
        setLoading(true);
        const newImages = [...value];
        newImages.splice(idx, 1)[0];
        setValue(newImages);

        const newTempUrls = [...tempUrls];
        const tempUrl = newTempUrls.splice(idx, 1)[0];
        URL.revokeObjectURL(tempUrl);
        setTempUrls(newTempUrls);
        setLoading(false);
    }

    const openImage = (idx: number) => {
        msContext.setContent(<DisplayImage imgUrl={tempUrls[idx]} />);
        msContext.openMenu();
    }

    useEffect(() => {
        const urls = [];
        for (let i=0; i<value.length; i++) {
            urls.push(URL.createObjectURL(value[i]));
        }
        setTempUrls(urls);
        
        return () => {
            tempUrls.forEach(url => URL.revokeObjectURL(url));
        }
    }, []);

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
                            <img src={tempUrls[i]} onClick={() => openImage(i)} />
                        </div>
                    ))}

                    {value.length<5 && <>
                        <BsPlusCircle onClick={(e: React.MouseEvent<SVGElement>) => imgRef.current?.click()} size={35} color={colorScheme.orangePrimary} style={{ cursor: 'pointer'}} />
                        <input ref={imgRef} type='file' accept={IMG_ACCEPTED_FILES} onChange={handleUpload} style={{display: 'none'}} />
                    </>}
                </div>
                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                    {alert && <Alert alert={alert}  />}
                </div>
            </>
            }
        </div>
    );
}



export function ListingPeriod({ value, setValue }: InputValue) {
    const [expires, setExpires] = useState<Date>(new Date(Date.now() + MONTH_TO_MILLI));

    const calcExpiration = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        let newMonths: number = 1;
        if (e.target.value==='') {
            setValue('');
            newMonths = 1;
        } else {
            const val = Math.min(Math.max(1, Number(e.target.value)), MAX_LISTING_PERIOD);
            setValue(val.toString());
            newMonths = val;
        }
        const offset = newMonths * MONTH_TO_MILLI;
        const expiration = new Date(Date.now() + offset);
        setExpires(expiration);
    }

    return (
        <div className={createPostStyles.formItem}>
            <h4>Listing Period</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <input type='number' placeholder='1' min='1' step='1' max={MAX_LISTING_PERIOD} style={{width: '100px'}} value={value} onChange={calcExpiration} />
            </div>
            
            <h5 className={createPostStyles.subText}>Post will expire {formatDate(expires)}</h5>
        </div>
    );
}



export function SuperListingPeriod({ value, setValue }: InputValue) {
    const [expires, setExpires] = useState<Date>();

    const calcExpiration = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        let newMonths: number = 1;
        if (e.target.value==='') {
            setValue('');
            newMonths = 1;
        } else {
            const val = Math.max(1, Number(e.target.value));
            setValue(val.toString());
            newMonths = val;
        }
        const offset = newMonths * MONTH_TO_MILLI;
        const expiration = new Date(Date.now() + offset);
        setExpires(expiration);
    }

    useEffect(() => {
        setExpires(new Date(Date.now() + MONTH_TO_MILLI));
    }, []);

    return (
        <div className={createPostStyles.formItem}>
            <h4>Super Listing Period</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <input type='number' placeholder='1' min='1' step='1' style={{width: '100px'}} value={value} onChange={calcExpiration} />
            </div>
            
            <h5 className={createPostStyles.subText}>Post will expire {formatDate(expires)}</h5>
        </div>
    );
}



export function UseFreeMonths({ iv, freeMonths }: { iv: InputValue, freeMonths: number }) {
    const { value, setValue } = iv;
    const max = Math.min(MAX_LISTING_PERIOD, freeMonths);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.value==='') {
            setValue('');
        } else {
            const val = Math.min(Math.max(0, Number(e.target.value)), max);
            setValue(val.toString());
        }
    }
    
    return (
        <div className={createPostStyles.formItem}>
            <h4>Free Months</h4>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <h4>Use</h4>
                <input type='number' placeholder='0' min='0' step='1' max={max} style={{width: 'fit-content'}} value={value} onChange={handleInput} />
                <h4>free {value === '1' ? 'month' : 'months'}</h4>
            </div>
            
            <h5 className={createPostStyles.subText}>You have {freeMonths} free {freeMonths==1 ? 'month' : 'months'} left.</h5>
        </div>
    );
}