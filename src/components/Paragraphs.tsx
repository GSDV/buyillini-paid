export default function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {paragraphs.map((text, i) => <h3 key={i}>{text}</h3>)}
        </div>
    );
}
