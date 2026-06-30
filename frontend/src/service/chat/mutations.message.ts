import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessageForMe } from "./endpoint.message";

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
          Messages: oldData.Messages.filter((msg: any) => !messageIds.includes(msg.id)),
        };
      });
    },

    onError: (error) => {
      console.error("Failed to delete message:", error);
    },
  });
};
