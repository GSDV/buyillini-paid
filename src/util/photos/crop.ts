'use client';

import { POST_WIDTH, POST_HEIGHT } from "@util/global";



export const makePostPicture = async (file: File) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
  
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(file);
    });
  
    canvas.width = POST_WIDTH;
    canvas.height = POST_HEIGHT;

    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, POST_WIDTH, POST_HEIGHT);
  
    const webpBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(null);
        }, 'image/webp', 0.8);
    });

    return webpBlob;
};