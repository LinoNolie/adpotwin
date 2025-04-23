export const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
    });
};

export const assetMetadata = {
    version: '1.0',
    author: 'Your Name',
    description: 'Assets for Metaverse image project',
};

export const supportedImageFormats = ['image/jpeg', 'image/png', 'image/gif'];