import { useMutation } from "@tanstack/react-query";
import { createConversationWithSeller } from "./endpoint.sellerProfile";

export const useCreateConversationMutation = () => {
  return useMutation({
    mutationFn: (sellerId: number) => createConversationWithSeller(sellerId),
  });
};
