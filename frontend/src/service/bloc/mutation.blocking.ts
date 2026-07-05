import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser } from "./endpoint.blocking";

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
