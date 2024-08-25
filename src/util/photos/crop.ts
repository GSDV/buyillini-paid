'use client';

import { POST_WIDTH, POST_HEIGHT, PFP_LENGTH } from "@util/global";



export const makePfpPicture = async (file: File) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
  
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(file);
    });
  
    canvas.width = PFP_LENGTH;
    canvas.height = PFP_LENGTH;

    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, PFP_LENGTH, PFP_LENGTH);
  
    const webpBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(null);
        }, 'image/webp', 0.8);
    });

    return webpBlob;
};



export const makePostPicture = async (file: File) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(file);
    });

    const targetWidth = POST_WIDTH;
    const targetHeight = POST_HEIGHT;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const aspectRatio = img.width / img.height;
    const targetAspectRatio = targetWidth / targetHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (aspectRatio > targetAspectRatio) {
        // Image is wider than target
        drawWidth = targetWidth;
        drawHeight = targetWidth / aspectRatio;
        offsetX = 0;
        offsetY = (targetHeight - drawHeight) / 2;
    } else {
        // Image is taller than target
        drawWidth = targetHeight * aspectRatio;
        drawHeight = targetHeight;
        offsetX = (targetWidth - drawWidth) / 2;
        offsetY = 0;
    }

    ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, drawWidth, drawHeight);

    const webpBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(null);
        }, 'image/webp', 0.8);
    });

    return webpBlob;
};