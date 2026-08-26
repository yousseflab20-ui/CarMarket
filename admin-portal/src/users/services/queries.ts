import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, patchUserStatus } from "./endpointUser";
import type { UsersFilters } from "../types/user.types";

export const useUsers = (filters: UsersFilters) =>
  useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => getUsers(filters),
    staleTime: 30_000,
  });

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};
