import { User } from '@prisma/client';

import VerticalLayout from '@components/containers/VerticalLayout';

import { formatDate, formatPhoneNumber, getPfpUrl } from '@util/global';



export default function DisplayUser({ user }: { user: User }) {
    return (
        <VerticalLayout>
            <img style={{width: '100px', height: '100px'}} src={getPfpUrl(user.profilePicture)}/>
            <h4><b>Display Name: </b>{user.displayName}</h4>
            <h4><b>NetId: </b>{user.netId}</h4>
            <h4><b>Email: </b>{user.email}</h4>
            <h4><b>Phone: </b>{formatPhoneNumber(user.phoneNumber)}</h4>
            <h4><b>ID: </b>{user.id}</h4>
            <h4><b>Role: </b>{user.role}</h4>
            <h4><b>Created: </b>{formatDate(new Date(user.createdAt))}</h4>

            <h4><b>Free Months: </b>{user.freeMonths}</h4>

            <h4><b>Active: </b>{user.active.toString()}</h4>
            <h4><b>Deleted: </b>{user.deleted.toString()}</h4>
            <h4><b>Banned: </b>{user.banned.toString()}</h4>
            {user.banned && <>
                <h4><b>Ban Msg: </b>{user.banMsg}</h4>
                <h4><b>Ban Expiration: </b>{user.banExpiration!=null ? formatDate(user.banExpiration) : 'never'}</h4>
            </>}
        </VerticalLayout>
    );
}