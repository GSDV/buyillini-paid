export const DOMAIN = 'https://buyillini.com';


export const CONTACT_EMAIL = `gs44@illinois.edu`;
export const EMAIL_FOOTER = `<p>Thank you for using BuyIllini. Contact ${CONTACT_EMAIL} for any questions.</p>`;


// Used for input elements and api routes.
export const ACCEPTED_FILES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const IMG_ACCEPTED_FILES = 'image/png, image/jpeg, image/jpg, image/webp';


// Get the AWS S3 image URL
export const DEFAULT_PFP = `/ui/default-profile-picture.png`;
export const imgUrl = (key: string) => `https://buyillini.s3.us-east-2.amazonaws.com/${key}`;
export const getPfpUrl = (key: string) => (key==='') ? DEFAULT_PFP : imgUrl(key);


export const formatPhoneNumber = (phoneStr: string) => `(${phoneStr.substring(0, 3)}) ${phoneStr.substring(3, 6)}-${phoneStr.substring(6, 10)}`;
export const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
export const formatPrice = (p: number) => `$${p.toFixed(2)}`;

export const getCategoryTitle = (link: string) => CATEGORIES.find(cat => cat.link === link)?.title;



// Each user gets this many free months when signing up
export const DEFAULT_FREE_MONTHS = 5;


// ActivateTokens are expired if they were sent more than an hour ago
export const ACTIVATE_TOKEN_EXPIRATION = 60;

// Reset password tokens are expired if they were sent more than 5 hours ago
export const RP_TOKEN_EXPIRATION = 60*5;

// How long before a buyer can contact a seller about the same item again
export const BUYER_INTEREST_EXPIRATION = 60*24;


// BuyIllini defines a "month" as 30 consecutive days.
export const DEFINED_MONTH = 30
export const MONTH_TO_MILLI = DEFINED_MONTH * 24 * 60 * 60 * 1000;



export const CATEGORIES = [
    {title: 'Sweatshirts', link: 'sweatshirts', img: '/categories/sweatshirts.png'},
    {title: 'Jackets', link: 'jackets', img: '/categories/jackets.png'},
    {title: 'T-Shirts', link: 't-shirts', img: '/categories/t-shirts.png'},
    {title: 'Shirts', link: 'shirts', img: '/categories/shirts.png'},
    {title: 'Tops', link: 'tops', img: '/categories/tops.png'},
    {title: 'Pants', link: 'pants', img: '/categories/pants.png'},
    {title: 'Shorts', link: 'shorts', img: '/categories/shorts.png'},
    {title: 'Dresses', link: 'dresses', img: '/categories/dresses.png'},
    {title: 'Shoes', link: 'shoes', img: '/categories/shoes.png'},
    {title: 'Athletics', link: 'athletics', img: '/categories/athletics.png'},
    {title: 'Hats', link: 'hats', img: '/categories/hats.png'},
    {title: 'Accessories', link: 'accessories', img: '/categories/accessories.png'},
    {title: 'Other', link: 'other', img: '/categories/other.png'}
] as const;
export type CategoryType = typeof CATEGORIES[number];


export const CLOTHING_SIZES = [
    'XS',
    'S',
    'M',
    'L',
    'XL'
] as const;
export type SizeType = typeof CLOTHING_SIZES[number];


export const GENDERS = [
    'Unisex',
    'Female',
    'Male'
] as const;
export type GenderType = typeof GENDERS[number];


export const POST_PER_PAGE = 15;
export const POST_PER_PAGE_ACCOUNT = 9;