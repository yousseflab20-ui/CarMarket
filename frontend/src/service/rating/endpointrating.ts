import API from '../api';


export const createRating = async (sellerId: number, rating: number, comment: string) => {
    const response = await API.post(`rating`, { sellerId, rating, comment });
    return response.data;
};

export const getSellerRating = async (sellerId: number) => {
    const response = await API.get(`rating/seller/${sellerId}`);
    console.log("response data rating", response.data.data)
    return response.data;
};
