export const DOMAIN = 'https://buyillini.com';


export const CONTACT_EMAIL = `contact@buyillini.com`;
export const EMAIL_FOOTER = `<p>Thank you for using BuyIllini. Email ${CONTACT_EMAIL} for any questions.</p>`;


// Used for input elements and api routes.
export const ACCEPTED_FILES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const IMG_ACCEPTED_FILES = 'image/png, image/jpeg, image/jpg, image/webp'; // rename to IMG_INPUT_ACCEPTED_FILES
export const IMG_SIZE_LIMIT = 15 * 1000000; // 15mb
export const IMG_SIZE_LIMIT_TXT = `15mb`;

export const POST_IMG_PREFIX = `post-f-`;
export const PFP_IMG_PREFIX = `pfp-f-`;


export const POST_WIDTH = 1200;
export const POST_HEIGHT = 2100;
export const PFP_LENGTH = 250;


// Get the AWS S3 image URL
export const BUYILLINI_LOGO = `https://buyillini.s3.us-east-2.amazonaws.com/bi-logo`;
export const DEFAULT_PFP = `/ui/default-profile-picture.png`;
export const imgUrl = (key: string) => `https://buyillini.s3.us-east-2.amazonaws.com/${key}`;
export const getPfpUrl = (key: string) => (key==='') ? DEFAULT_PFP : imgUrl(key);


export const formatPhoneNumber = (phoneStr: string) => `(${phoneStr.substring(0, 3)}) ${phoneStr.substring(3, 6)}-${phoneStr.substring(6, 10)}`;
export const formatDate = (d: Date | undefined) => {
    if (d==undefined) return '';
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}
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



export const MAX_LISTING_PERIOD = 10;


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
    {title: 'Apartment', link: 'apartment', img: '/categories/apartment.png'},
    {title: 'School', link: 'school', img: '/categories/school.png'},
    {title: 'Other', link: 'other', img: '/categories/other.png'}
] as const;
export type CategoryType = typeof CATEGORIES[number];

export const NO_SIZE_GENDER_CATEGORIES = [
    'hats',
    'accessories',
    'apartment',
    'school',
    'other'
];

// Is this category one with Size and Gender fields?
export const isRegCat = (cat: string) => !NO_SIZE_GENDER_CATEGORIES.includes(cat);



export const CLOTHING_SIZES = [
    'XS',
    'S',
    'M',
    'L',
    'XL'
];
// export type SizeType = typeof CLOTHING_SIZES[number];


export const GENDERS = [
    'Unisex',
    'Female',
    'Male'
];


export const POST_PER_PAGE = 15;
export const POST_PER_PAGE_ACCOUNT = 9;



export const delay = (s: number) => new Promise(resolve => setTimeout(resolve, s*1000));