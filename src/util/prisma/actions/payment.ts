'use server';

import { prisma } from '@util/prisma/client';


export const addPaymentToPost = async (postId: string, stripeSessionId: string, amount: number) => {
    const res = await prisma.payment.create({
        data: {
            postId,
            stripeSessionId,
            amount
        }
    });
}

export const markPostPaid = async (paymentId: string) => {
    const res = await prisma.payment.update({
        where: { id: paymentId },
        data: { successfullyPaid: true }
    });
}

export const deleteAllFailedPostPayments = async (postId: string) => {
    const res = await prisma.payment.deleteMany({
        where: { postId, successfullyPaid: false },
    })
}