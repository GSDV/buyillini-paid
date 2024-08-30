import { imgUrl } from "@util/global";



export const urlToFile = async (s3Url: string) => {
    const response = await fetch(imgUrl(s3Url), {
        mode: 'cors',
        credentials: 'omit'
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    const file = new File([blob], s3Url, { type: 'image/webp' });
    return file;
}


