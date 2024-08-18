import Link from 'next/link';



export default function NotLoggedIn() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h2 style={{fontWeight: 500}}>You are not logged in.</h2>
            <h4>Please <Link href='/login'>log in</Link> or <Link href='/signup'>sign up</Link> to continue.</h4>
        </div>
    )
}