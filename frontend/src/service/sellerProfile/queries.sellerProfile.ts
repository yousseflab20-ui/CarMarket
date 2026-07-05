import { useQuery } from "@tanstack/react-query";
import { getSellerProfile, getSellerRatingById } from "./endpoint.sellerProfile";
import { User } from "../../types/user";
import { SellerRatingResponse } from "../../types/rating";

export const useSellerProfileQuery = (userId: number | undefined) => {
  return useQuery<User, Error>({
    queryKey: ["sellerProfile", userId],
    queryFn: () => getSellerProfile(userId!),
    enabled: !!userId,
  });
};

export const useSellerRatingQuery = (sellerId: number | undefined) => {
  return useQuery<SellerRatingResponse, Error>({
    queryKey: ["sellerRating", sellerId],
    queryFn: () => getSellerRatingById(sellerId!),
    enabled: !!sellerId,
  });
};
