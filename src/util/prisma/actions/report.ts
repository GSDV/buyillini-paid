'use server';
import { prisma } from '@util/prisma/client';



export const reportPost = async (reporterId: string, postId: string, msg: string) => {
    const res = await prisma.postReport.create({
        data: {
            reporterId: reporterId,
            reportedPostId: postId,
            msg: msg
        }
    });
}



export const didUserAlreadyReportPost = async (reporterId: string, reportedPostId: string) => {
    const postReportPrisma = await prisma.postReport.findFirst({
        where: { reporterId: reporterId, reportedPostId }
    });
    return postReportPrisma!=null;
}