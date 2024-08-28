import sgMail from '@sendgrid/mail';

import { CONTACT_EMAIL, DOMAIN, EMAIL_FOOTER, formatPhoneNumber } from '@util/global';
import { PostWithRedactedUser, RedactedUser } from '@util/prisma/types';



export const sendResetPasswordEmail = async (email: string, token: string) => {
    const msgText = `BuyIllini Reset Password. Copy and past the following link into your browser to reset your account password: ${DOMAIN}/password/${token}.`;
    const msgHtml = `
        <h1>BuyIllini Reset Password</h1>
        <p>Click <a href="${DOMAIN}/password/${token}">here</a> to reset your BuyIllini password.</p>
        <p>If the above link does not work, copy and past the following into your browser: ${DOMAIN}/password/${token}</p>

        <br />

        ${EMAIL_FOOTER}
    `;
    const mail = {
        email: email,
        subject: 'Reset Your BuyIllini Account Password',
        msgText: msgText,
        msgHtml: msgHtml
    }

    const sgCode = await sendEmail(mail);
    return sgCode;
}



export const sendActivationEmail = async (email: string, token: string) => {
    const msgText = `BuyIllini Account Activation. Copy and past the following link into your browser to activate your BuyIllini account: ${DOMAIN}/activate/${token}.`;
    const msgHtml = `
        <h1>BuyIllini Verification</h1>
        <p>Click <a href="${DOMAIN}/activate/${token}">here</a> to activate your BuyIllini account.</p>
        <p>If the above link does not work, copy and past the following into your browser: ${DOMAIN}/activate/${token}</p>

        <br />

        ${EMAIL_FOOTER}
    `;
    const mail = {
        email: email,
        subject: 'Activate Your BuyIllini Account',
        msgText: msgText,
        msgHtml: msgHtml
    };

    const sgCode = await sendEmail(mail);
    return sgCode;
}



export const sendBuyRequest = async (buyer: RedactedUser, buyerMsg: string, post: PostWithRedactedUser) => {
    const msgText = `BuyIllini Interest. We wanted to inform you that "${buyer.displayName}" is interested in purchasing "${post.title}". Contact this buyer through "${buyer.email}".`;
    const msgHtml = `
        <h1>Buyer Interest</h1>
        <p>${buyer.displayName} is interested in purchasing "<a href='${DOMAIN}/post/${post.id}'>${post.title}</a>". Contact this buyer through:</p>
        <ul>
            <li>Email: ${buyer.email}</li>
            ${(buyer.phoneNumber!='' ? `<li>Phone: ${formatPhoneNumber(buyer.phoneNumber)}</li>` : ``)}
        </ul>

        <br />

        ${buyerMsg!='' ? `<p>Buyer's message:</p><p>${buyerMsg}</p>`: ``}

        <br />

        ${EMAIL_FOOTER}
    `;
    const mail = {
        email: post.seller.email,
        subject: 'BuyIllini Interest',
        msgText: msgText,
        msgHtml: msgHtml
    };

    const sgCode = await sendEmail(mail);
    return sgCode;
}




export interface MailType {
    email: string,
    subject: string,
    msgText: string,
    msgHtml: string
}
export const sendEmail = async (mail: MailType) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    const msg = {
        to: mail.email,
        from: {
            email: CONTACT_EMAIL,
            name: 'BuyIllini'
        },
        subject: mail.subject,
        text: mail.msgText,
        html: mail.msgHtml
    };

    const mailRes = await sgMail.send(msg);

    // https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/responses
    return mailRes[0].statusCode;
}