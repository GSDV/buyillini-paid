'use client';

export async function urlToFile(s3Url: string) {
    console.log(s3Url)
    const response = await fetch(s3Url);
    console.log("is ok:", response.ok)
    if (!response.ok) return null;
    const blob = await response.blob();
    const file = new File([blob], s3Url, { type: 'image/webp' });
    return file;
}