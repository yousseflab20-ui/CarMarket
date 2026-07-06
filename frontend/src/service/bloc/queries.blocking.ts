import { getBlockStatus } from "./endpoint.blocking";
import { useQuery } from "@tanstack/react-query";

export const useBlockStatusQuery = (blockedId: number) => {
  return useQuery({
    queryKey: ["blocked-users", blockedId],
    queryFn: () => getBlockStatus(blockedId),
    enabled: !!blockedId,
  });
};
