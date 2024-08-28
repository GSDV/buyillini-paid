export default function DisplayImage({ imgUrl }: { imgUrl: string }) {
    return (
        <div style={{ position: 'relative', width: '60%', maxWidth: '450px', aspectRatio: 0.57142857142, backgroundColor: 'black' }} >
            <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
}