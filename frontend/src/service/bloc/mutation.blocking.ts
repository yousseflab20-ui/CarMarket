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

    onMutate: async (conversationId: number) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"] });
      const previousConversations = queryClient.getQueryData(["conversations"]);

      queryClient.setQueryData(["conversations"], (old: any) => {
        if (!old) return old;
        return old.filter((conv: any) => conv.id !== conversationId);
      });

      return { previousConversations };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations"], context.previousConversations);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};
