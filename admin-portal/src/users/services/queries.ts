import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, patchUserStatus, getUserDetails } from "./endpointUser";
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", variables.userId] });
    },
  });
};

export const useUserDetails = (userId: number | null) =>
  useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => getUserDetails(userId!),
    enabled: !!userId,
  });

export const useUserStatusHistory = (userId: number | null) =>
  useQuery({
    queryKey: ["admin-user-history", userId],
    queryFn: () => import("./endpointUser").then((m) => m.getUserStatusHistory(userId!)),
    enabled: !!userId,
  });
