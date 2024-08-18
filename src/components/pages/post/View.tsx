import { useState } from 'react';

import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle, IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { useMenuShadowContext } from '@components/providers/MenuShadow';

import { formatDate, formatPrice, getCategoryTitle, imgUrl } from '@util/global';

import { Post } from '@prisma/client';

import postStyles from '@styles/pages/view-post.module.css';
import clsx from 'clsx';



export default function ViewPost({ post }: { post: Post }) {
    return (
        <div className={postStyles.container}>
            <SlideShow images={post.images} />
            <div className={postStyles.info}>
                <h1>{post.title}</h1>
                <h4>{post.description}</h4>
                <h3>{formatPrice(Number(post.price))}</h3>
                <h3>Category: {getCategoryTitle(post.category)}</h3>
                {post.category!='other' && <h3>Size: {post.size}</h3>}
                {post.category!='other' && <h3>Gender: {post.gender}</h3>}
                <h3>Expires on {formatDate(new Date(post.expireDate))}</h3>
            </div>
        </div>
    );
}


function SlideShow({ images }: { images: string[] }) {
    const msContext = useMenuShadowContext();
    const [idx, setIdx] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = idx === 0;
        const newIndex = isFirstSlide ? images.length - 1 : idx - 1;
        setIdx(newIndex);
    };
    
    const goToNext = () => {
        const isLastSlide = idx === images.length - 1;
        const newIndex = isLastSlide ? 0 : idx + 1;
        setIdx(newIndex);
    };

    const openImage = (img: string) => {
        msContext.setContent(<DisplayImage img={img} />);
        msContext.openMenu();
    }

    const arrowLeft = clsx({
        [postStyles.arrow]: true,
        [postStyles.hidden]: (idx==0)
    });

    const arrowRight = clsx({
        [postStyles.arrow]: true,
        [postStyles.hidden]: (idx==images.length-1)
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px', flex: 4 }}>
            <IoIosArrowBack className={arrowLeft} onClick={goToPrevious} />

            <div className={postStyles.slideshow}>
                <div className={postStyles.slidesContainer} style={{ transform: `translateX(-${idx * 100}%)` }} >
                    {images.map((img, index) => (
                        <div key={index} className={postStyles.slide}>
                            <img onClick={()=>openImage(img)} src={imgUrl(img)} />
                        </div>
                    ))}
                </div>
            </div>

            <IoIosArrowForward className={arrowRight} onClick={goToNext} />
        </div>
    );
}


function DisplayImage({ img }: { img: string }) {
    return (
        <div style={{ position: 'relative', width: '60%', maxWidth: '450px', aspectRatio: 0.57142857142, backgroundColor: 'black' }} >
            <img src={imgUrl(img)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
}

