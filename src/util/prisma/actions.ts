'use server';
import prisma from '@util/prisma/client';
import { v4 as uuidv4 } from 'uuid';



export const getUserFromAuth = async (authtoken: string) => {
    const authTokenPrisma = await prisma.authToken.findFirst({
        where: { token: authtoken },
        include: { user: {
            include: {items: true}
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


export const getUserWithActivationTokens = async (email: string) => {
    const userPrisma = await prisma.user.findFirst({
        where: { email: email },
        include: { activateTokens: true }
    });
    return userPrisma;
}



export const updateUser = async (id: string, data: any) => {
    await prisma.user.update({
        where: { id: id },
        data: data
    });
}



export const deleteUser = async (id: string) => {
    await prisma.user.update({
        where: { id: id },
        data: { deleted: true }
    });
    await prisma.item.updateMany({
        where: { sellerId: id },
        data: { deleted: true }
    });
    await prisma.authToken.deleteMany({
        where: { userId: id }
    });
}



export const createAuthToken = async (userId: string) => {
    const token = uuidv4();
    const tokenCreationRes = await prisma.authToken.create({
        data: {
            token: token,
            user: { connect: { id: userId } }
        }
    });
    return token;
}



export const activateAccount = async (id: string) => {
    const userUpdate = await prisma.user.update({
        where: { id: id },
        data: { active: true }
    });
}
export const getActivateToken = async (token: string) => {
    const tokenPrisma = await prisma.activateToken.findFirst({
        where: { token: token },
        include: { user: true }
    });
    return tokenPrisma;
}
export const createActivateToken = async (userId: string) => {
    const token = uuidv4();
    const tokenCreationRes = await prisma.activateToken.create({
        data: {
            token: token,
            user: { connect: { id: userId } }
        }
    });
    return token;
}



export const logOut = async (authToken: string) => {
    await prisma.authToken.delete({
        where: { token: authToken },
    });
}