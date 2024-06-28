'use server';
import prisma from '@util/prisma/client';
// import { v4 as uuidv4 } from 'uuid';



export const getUser = async (id: string) => {
    const userPrisma = await prisma.user.findFirst({
        where: { id: id }
    });
    return userPrisma;
}

export const getUserFromAuth = async (authtoken: string) => {
    const authTokenPrisma = await prisma.authToken.findFirst({
        where: { token: authtoken },
        include: { user: {
            include: { items: true }
        }}
    });
    if (!authTokenPrisma) return null;
    return authTokenPrisma.user;
}

export const getUserFromNetId = async (netid: string) => { return getUserFromEmail(netid.concat('@illinois.edu')); }
export const getUserFromEmail = async (email: string) => {
    const userPrisma = await prisma.user.findFirst({
        where: { email: email },
        include: { items: true }
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
