'use server';
import { prisma } from '@util/prisma/client';
import { PromoCode } from '@prisma/client';



export const getPromoCode = async (promoCode: string) => {
    const promoCodePrisma = await prisma.promoCode.findFirst({
        where: { code: promoCode }
    });
    return promoCodePrisma;
}



export const claimPromoCode = async (userId: string, promo: PromoCode) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            promoCodes: { push: promo.code },
            freeMonths: { increment: promo.freeMonths }
        }
    });
}