'use client';

export const makePostPicture = async (file: File) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
  
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(file);
    });
  
    canvas.width = 250;
    canvas.height = 250;

    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 250, 250);
  
    const webpBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(null);
        }, 'image/webp', 0.8);
    });

    return webpBlob;
};