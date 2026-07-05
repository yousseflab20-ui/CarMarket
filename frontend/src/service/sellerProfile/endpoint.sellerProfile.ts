import API from "../api";

export const getSellerProfile = async (userId: number) => {
  const response = await API.get(`auth/user/${userId}`);
  return response.data;
};

export const getSellerRatingById = async (sellerId: number) => {
  const response = await API.get(`rating/seller/${sellerId}`);
  return response.data;
};

export const createConversationWithSeller = async (sellerId: number) => {
  const response = await API.post(`chat/conversation/${sellerId}`);
  return response.data;
};
