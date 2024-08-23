import LoadingIcons from 'react-loading-icons'
import { colorScheme } from '@styles/colors';


export default function Loading() {
    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
            <LoadingIcons.TailSpin stroke={colorScheme.black} />
            <h3 style={{color: colorScheme.black}}>Loading</h3>
        </div>
    );
}

export function CheckIfLoading({ loading, content }: { loading: boolean, content: React.ReactNode }) {
    if (loading) return <Loading />;
    return <>{content}</>;
}

export function LoadingIconBlack() {
    return <LoadingIcons.TailSpin stroke={colorScheme.black} />;
}