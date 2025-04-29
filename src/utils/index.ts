export const formatImageData = (data: any) => {
    // Format the image data for Metaverse objects
    return {
        id: data.id,
        url: data.url,
        title: data.title || 'Untitled',
        description: data.description || '',
    };
};

export const validateImage = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
};

export const processImage = async (file: File) => {
    // Process the image (e.g., resize, compress)
    const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return imageDataUrl;
};