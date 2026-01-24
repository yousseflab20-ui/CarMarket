import API_URL from '../constant/URL';
/**
 * Constructs the full image URL from the backend photo field.
 * 
 * @param photo - The photo field from the car object (can be a comma-separated string of filenames).
 * @param index - The index of the image to retrieve (default is 0).
 * @returns The full URL to the image, or a placeholder if no image exists.
 */
export const getCarImageUrl = (photo: string | null | undefined, index: number = 0): string => {
    if (!photo) {
        return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    if (photo.startsWith('http')) {
        return photo;
    }
    const photos = photo.split(',').map(p => p.trim());
    const selectedPhoto = photos[index] || photos[0];
    if (!selectedPhoto) {
        return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    const baseUrl = API_URL.replace('/api', '');

    const finalPath = selectedPhoto.startsWith('/uploads/')
        ? selectedPhoto
        : `/uploads/${selectedPhoto}`;

    return `${baseUrl}${finalPath}`;
};
