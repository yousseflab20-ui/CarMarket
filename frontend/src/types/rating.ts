export interface Rating {
    id: number;
    sellerId: number;
    buyerId: number;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface SellerRatingResponse {
    averageRating: string | number;
    totalRatings: number;
    ratings?: Rating[];
}
