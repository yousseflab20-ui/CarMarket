import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser, unblockUser } from "./endpoint.blocking";

export const useBlockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedId: number) => blockUser(blockedId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["blocked-users"],
      });
    },
  });
};

export const useUnblockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockedId: number) => unblockUser(blockedId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["blocked-users"],
      });
    },
  });
};
