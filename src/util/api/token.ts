import { ActivateToken, RPToken } from '@prisma/client';
import { ACTIVATE_TOKEN_EXPIRATION, RP_TOKEN_EXPIRATION } from '@util/global';



export const isLastRPTokenExpired = (tokens: RPToken[]) => {
    if (tokens.length==0) return true;
    const lastToken = tokens[tokens.length-1];
    return isRPTokenExpired(lastToken);
}
export const isRPTokenExpired = (token: RPToken) => {
    const tokenTime = token.createdAt;
    const currentTime = new Date();

    const timeDifference = currentTime.getTime() - tokenTime.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    return minutesDifference > RP_TOKEN_EXPIRATION;
}



export const isLastActivationTokenExpired = (tokens: ActivateToken[]) => {
    if (tokens.length==0) return true;
    const lastToken = tokens[tokens.length-1];
    return isActivationTokenExpired(lastToken);
}
export const isActivationTokenExpired = (token: ActivateToken) => {
    const tokenTime = token.createdAt;
    const currentTime = new Date();

    const timeDifference = currentTime.getTime() - tokenTime.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    return minutesDifference > ACTIVATE_TOKEN_EXPIRATION;
}