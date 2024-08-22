
import VerticalLayout from '@components/containers/VerticalLayout';
import { PromoCode } from '@prisma/client';


export default function DisplayPromo({ promo }: { promo: PromoCode }) {
    return (
        <VerticalLayout>
            <h4><b>Promo Code: </b>{promo.code}</h4>
            <h4><b>Free Months: </b>{promo.freeMonths}</h4>
            <h4><b>Eligible Users: </b>{promo.eligibleUsers}</h4>
            <h4><b>Eligible Users: </b></h4>
            <ul>
                {promo.eligibleUsers.map((netId, i) => <li key={i}>{netId}</li>)}
            </ul>

        </VerticalLayout>
    )
}