/**
 * Returns the full image URL for a car.
 * Supports Cloudinary URLs and placeholder if no image.
 * 
 * @param photo - String of image URLs (comma-separated) or single URL
 * @param index - Index of image to return (default 0)
 */
export const getCarImageUrl = (photo: string | null | undefined, index: number = 0): string => {
    if (!photo) {
        return 'https://via.placeholder.com/400x300?text=No+Image';
    }

    const photos = photo.split(',').map(p => p.trim());
    const selectedPhoto = photos[index] || photos[0];

    if (!selectedPhoto) {
        return 'https://via.placeholder.com/400x300?text=No+Image';
    }

    // If already full URL (Cloudinary or any http link), return as is
    if (selectedPhoto.startsWith('http')) {
        return selectedPhoto;
    }

    // Fallback placeholder for any non-URL string
    return 'https://via.placeholder.com/400x300?text=No+Image';
};
