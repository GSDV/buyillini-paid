'use server';
import { prisma } from '@util/prisma/client';
import { v4 as uuidv4 } from 'uuid';



export const createAuthToken = async (userId: string) => {
    const token = uuidv4();
    await prisma.authToken.create({
        data: {
            token: token,
            user: { connect: { id: userId } }
        }
    });
    return token;
}
export const deleteAuthToken = async (authToken: string) => {
    await prisma.authToken.delete({
        where: { token: authToken }
    });
}



export const createActivateToken = async (userId: string) => {
    const token = uuidv4();
    await prisma.activateToken.create({
        data: {
            token: token,
            user: { connect: { id: userId } }
        }
    });
    return token;
}
export const getActivateToken = async (token: string) => {
    const tokenPrisma = await prisma.activateToken.findFirst({
        where: { token: token },
        include: { user: true }
    });
    return tokenPrisma;
}



export const createRpToken = async (userId: string) => {
    const token = uuidv4();
    await prisma.rPToken.create({
        data: {
            token: token,
            user: { connect: {id: userId} }
        }
    });
    return token;
}
export const getRpToken = async (token: string) => {
    const tokenPrisma = await prisma.rPToken.findFirst({
        where: { token }
    });
    return tokenPrisma;
}
export const deleteAllusersRPTokens = async (userId: string) => {
    await prisma.rPToken.deleteMany({
        where: { userId }
    });
}