import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessageForMe } from "./endpoint.message";

export const useDeleteMessageForMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
    }: {
      messageId: number;
      conversationId: number;
    }) => deleteMessageForMe(messageId),

    onSuccess: (_, { messageId, conversationId }) => {
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          Messages: oldData.Messages.filter((msg: any) => msg.id !== messageId),
        };
      });
    },

    onError: (error) => {
      console.error("Failed to delete message:", error);
    },
  });
};
