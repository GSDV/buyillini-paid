'use server';
import prisma from '@util/prisma/client';
import { v4 as uuidv4 } from 'uuid';



export const makeRpToken = async (userId: string) => {
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
    const tokenPrisma = prisma.rPToken.findFirst({
        where: { token: token }
    });
    return tokenPrisma;
}