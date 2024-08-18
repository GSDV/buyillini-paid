import { User } from '@prisma/client';
import { RedactedUser } from '@util/prisma/types';
import { DOMAIN, CONTACT_EMAIL } from '@util/global';



export const isValidUser = (user: User | RedactedUser | null) => {
    if (!user) return { valid: false, nextres: { cStatus: 404, msg: `User does not exist. Sign up.` } };
    if (user.banned) return { valid: false, nextres: { cStatus: 410, msg: `This account has been banned: ${user.banMsg}` } };
    if (user.deleted) return { valid: false, nextres: { cStatus: 411, msg: `This account has been deleted. Please email ${CONTACT_EMAIL} to reactivate your account.` } };
    if (!user.active) return { valid: false, nextres: { cStatus: 412, msg: `This account is not active. Please go to ${DOMAIN}/activate.` } };
    return { valid: true };
}

