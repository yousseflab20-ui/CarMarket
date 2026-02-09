export const uploadToCloudinary = async (imageUri: string): Promise<string> => {
    try {
        const CLOUD_NAME = "dkdelt4tc";
        const UPLOAD_PRESET = "expo_cars";

        const formData = new FormData();

        // @ts-ignore 
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
        });

        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Cloudinary error:', error);
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json();
        console.log('✅ Uploaded:', data.secure_url);

        return data.secure_url;

    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

export const uploadMultipleToCloudinary = async (
    imageUris: string[]
): Promise<string[]> => {
    try {
        console.log(`📤 Uploading ${imageUris.length} images...`);

        const uploadPromises = imageUris.map(uri => uploadToCloudinary(uri));
        const urls = await Promise.all(uploadPromises);

        console.log('✅ All images uploaded');
        return urls;

    } catch (error) {
        console.error('Multiple upload error:', error);
        throw error;
    }
};