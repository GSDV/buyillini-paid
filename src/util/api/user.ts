import bcrypt from 'bcryptjs';



export const isValidEmail = (email: string) => {
    const pattern = /^[a-zA-Z0-9]+@illinois\.edu$/;
    return pattern.test(email);
}


export const isValidPassword = (input: string) => {
    const pattern = /^[a-zA-Z0-9#$&%]+$/;
    return pattern.test(input) && input.length <= 50 && input.length >= 5;
}


export const allFieldsPresent = (formData: any) => {
    return formData.displayName!=null && formData.displayName!='' && formData.email!=null && formData.email!='' && formData.password!=null && formData.password!='';
}


export const makePasswordHash = async (input: string) => {
    const salt_rounds = Number(process.env.SALT_ROUNDS as string);
    const salt = await bcrypt.genSalt(salt_rounds);
    const hashedPassword = await hashPassword(input, salt);
    return { hashedPassword, salt };
}

export const hashPassword = async (input: string, salt: string) => {
    const hashedPassword = await bcrypt.hash(input, salt);
    return hashedPassword;
}



// Phone number is optional, so empty string is allowed
export const isValidPhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\d+$/;
    let num = phoneNumber.replace(/[() "-]/g, '');
    return (num.length==0 || (num.length==10 && phoneRegex.test(num)));
}