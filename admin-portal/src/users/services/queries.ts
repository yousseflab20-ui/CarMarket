import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, patchUserStatus, getUserDetails, deleteUser, exportUsersCSV, bulkUpdateStatus, bulkDeleteUsers } from "./endpointUser";
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

export const useDeleteUser = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onSuccess();
    },
  });
};

export const useExportUsers = () => {
  return useMutation({
    mutationFn: (filters: Omit<UsersFilters, 'page'>) => exportUsersCSV(filters),
    onSuccess: (blob) => {
      // Trigger file download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carmarket-users-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  });
};

export const useBulkUpdateStatus = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userIds: number[]; status: "ACTIVE" | "RESTRICTED" | "BLOCKED"; reason?: string }) =>
      bulkUpdateStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onSuccess();
    },
  });
};

export const useBulkDeleteUsers = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: number[]) => bulkDeleteUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onSuccess();
    },
  });
};
