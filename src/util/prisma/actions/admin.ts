// Admin actions
'use server';

import { prisma } from '@util/prisma/client';
import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { RedactedUser } from '@util/prisma/types';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';


export const isAdmin = async (authTokenCookie: RequestCookie | undefined) => {
    if (!authTokenCookie) return false;
    const userPrisma = await getRedactedUserFromAuth(authTokenCookie.value);
    return isUserAdmin(userPrisma);
}

export const isUserAdmin = (user: RedactedUser | null) => {
    return !(!user || user.banned || user.deleted || !user.active || user.role!='ADMIN');
}





/*********
 * USERS *
 *********/

export const getUser = async (where: any) => {
    return (await prisma.user.findFirst({ where }));
}

export const updateUser = async (where: any, data: any) => {
    await prisma.user.update({ where, data });
}


// Mark a user as deleted, and mark all of his posts as deleted too
export const markDeleteUser = async (where: any) => {
    const res = await prisma.user.update({
        where,
        data: {
            deleted: true,
            posts: {
                updateMany: {
                    where: { deleted: false, active: true },
                    data: { deleted: true }
                }
            }
        }
    });
}


export const deleteUser = async (where: any) => {
    const res = await prisma.user.delete({ where });
}


export const banUser = async (where: any, msg: string, expiration: Date | null) => {
    const res = await prisma.user.update({
        where,
        data: {
            banned: true,
            banMsg: msg,
            banExpiration: expiration,
            posts: {
                updateMany: {
                    where: { deleted: false, active: true },
                    data: { deleted: true }
                }
            }
        }
    });
}





/*********
 * POSTS *
 *********/


// export const updateAllUsersPost = async (sellerId: string, data: any) => {
//     await prisma.post.updateMany({
//         where: { sellerId: sellerId },
//         data
//     });
// }


// export const markDeleteAllUsersPost = async (sellerId: string) => {
//     await prisma.post.updateMany({
//         where: { sellerId: sellerId },
//         data: { deleted: true }
//     });
// }

// export const e = async (netId: string) => {
//     const result = await prisma.user.update({
//         where: { netId: netId },
//         data: {
//             posts: {
//                 updateMany: {
//                     where: { deleted: false },
//                     data: { deleted: true }
//                 }
//             }
//         }
//     });
    
// }


// export const updateAllUsersPost = async (netId: string, data: any) => {
//     await prisma.user.update({
//         where: { seller: { netId: netId} },
//         data
//     });
// }



// export const markUserAsDeleted = async (id: string) => {
//     await prisma.user.update({
//         where: { id: id },
//         data: { deleted: true }
//     });
//     await prisma.post.updateMany({
//         where: { sellerId: id },
//         data: { deleted: true }
//     });
// }





/*********
 * PROMO *
 *********/


export const makePromoCode = async (code: string, eligibleUsers: string[], freeMonths: number) => {
    await prisma.promoCode.create({
        data: {
            code: code.toUpperCase(),
            eligibleUsers,
            freeMonths
        }
    });
}



export const deletePromoCode = async (code: string) => {
    await prisma.promoCode.delete({
        where: { code: code.toUpperCase() }
    });
}