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
  hasRatedSeller?: boolean; // Optional property to indicate if the user has rated the seller
}
