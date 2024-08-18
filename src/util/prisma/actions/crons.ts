'use server';

import { prisma } from '@util/prisma/client';



export const markDeleteAllExpiredPosts = async () => {
    const now = new Date();
    const res = await prisma.post.updateMany({
        where: { deleted: false, active: true, expireDate: {lte: now} },
        data: { deleted: true }
    });
    return res.count;
}



export const unbanExpiredUsers = async () => {
    const now = new Date();
    const res = await prisma.user.updateMany({
        where: { banned: true, active: true, banExpiration: {not: null, lte: now} },
        data: { banned: false, banMsg: null, banExpiration: null,  }
    });
    return res.count;
}