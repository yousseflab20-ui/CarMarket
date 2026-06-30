import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteMessageForMe,
  deleteMessageForEveryone,
} from "./endpoint.message";

export const useDeleteMessageForMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageIds,
      conversationId,
    }: {
      messageIds: number[];
      conversationId: number;
    }) => deleteMessageForMe(messageIds),

    onSuccess: (_, { messageIds, conversationId }) => {
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          Messages: oldData.Messages.filter(
            (msg: any) => !messageIds.includes(msg.id),
          ),
        };
      });
    },

    onError: (error) => {
      console.error("Failed to delete message:", error);
    },
  });
};

export const useDeleteMessageForEveryone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageIds,
      conversationId,
    }: {
      messageIds: number[];
      conversationId: number;
    }) => deleteMessageForEveryone(messageIds),

    onMutate: async ({ messageIds, conversationId }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });

      const previousMessages = queryClient.getQueryData(["messages", conversationId]);

      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          Messages: oldData.Messages.map((msg: any) =>
            messageIds.includes(msg.id)
              ? {
                  ...msg,
                  deletedForEveryone: true,
                }
              : msg,
          ),
        };
      });

      return { previousMessages, conversationId };
    },

    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },

    onError: (error, _, context) => {
      console.error("Failed to delete messages for everyone:", error);
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", context.conversationId], context.previousMessages);
      }
    },
  });
};
