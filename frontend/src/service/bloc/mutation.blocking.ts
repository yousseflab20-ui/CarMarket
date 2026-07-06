import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  blockUser,
  unblockUser,
  deleteConversation,
} from "./endpoint.blocking";

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

export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: number) => deleteConversation(conversationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};
