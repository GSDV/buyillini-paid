'use server';

import { prisma } from '@util/prisma/client';
import { DEFAULT_FREE_MONTHS, getPfpUrl, imgUrl } from '@util/global';
import { makePasswordHash } from '@util/api/user';



export const createUser = async (name: string, email: string, password: string) => {
    const netId = email.split('@')[0];
    const { hashedPassword, salt } = await makePasswordHash(password);
    const userPrisma = await prisma.user.create({
        data: {
            displayName: name,
            netId: netId,
            email: email,
            password: hashedPassword,
            salt: salt,
            freeMonths: DEFAULT_FREE_MONTHS
        }
    });
    return userPrisma.id;
}



export const getUser = async (query: any) => {
    const userPrisma = await prisma.user.findFirst({
        where: query
    });
    return userPrisma;
}

export const getRedactedUser = async (query: any) => {
    const userPrisma = await prisma.user.findFirst({
        where: query,
        omit: { password: true, salt: true  }
    });
    return userPrisma;
}

export const getRedactedUserWithItems = async (query: any) => {
    const userPrisma = await prisma.user.findFirst({
        where: query,
        omit: { password: true, salt: true  },
        include: { posts: true }
    });
    return userPrisma;
}


export const getRedactedUserFromAuth = async (authtoken: string) => {
    const authTokenPrisma = await prisma.authToken.findFirst({
        where: { token: authtoken },
        include: { user: {
            omit: { password: true, salt: true  }
        }}
    });
    // return null if auth token is expired
    if (!authTokenPrisma) return null;
    return authTokenPrisma.user;
}



export const subtractFreeMonths = async (id: string, amount: number) => {
    const res = await prisma.user.update({
        where: { id: id },
        data: {
            freeMonths: { decrement: amount }
        }
    });
}



export const navbarInfo = async (authToken: string) => {
    const tokenPrisma = await prisma.authToken.findFirst({
        where: {token: authToken},
        include: {user: true}
    });

    let pfp = '';
    let netId = '';
    if (!tokenPrisma || !tokenPrisma.user) return { pfp, netId };

    pfp = getPfpUrl(tokenPrisma.user.profilePicture)
    netId = tokenPrisma.user.netId;

    return { pfp, netId };
}




export const updateUser = async (id: string, data: any) => {
    await prisma.user.update({
        where: { id: id },
        data: data
    });
}



export const activateAccount = async (id: string) => {
    const userUpdate = await prisma.user.update({
        where: { id: id },
        data: { active: true }
    });
}



export const getUserWithActivationTokens = async (email: string) => {
    const userPrisma = await prisma.user.findFirst({
        where: { email: email },
        include: { activateTokens: true }
    });
    return userPrisma;
}

export const getUserWithRpTokens = async (email: string) => {
    const userPrisma = await prisma.user.findFirst({
        where: { email: email },
        include: { rpTokens: true }
    });
    return userPrisma;
}



export const changePassword = async (userId: string, hashedPassword: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });
}


export const markUserAsDeleted = async (id: string) => {
    await prisma.user.update({
        where: { id: id },
        data: { deleted: true }
    });
    await prisma.post.updateMany({
        where: { sellerId: id, active: true },
        data: { deleted: true }
    });
}