import { imgUrl } from '@util/global';



export default function DisplayImage({ img }: { img: string }) {
    return (
        <div style={{ position: 'relative', width: '60%', maxWidth: '450px', aspectRatio: 0.57142857142, backgroundColor: 'black' }} >
            <img src={imgUrl(img)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
}