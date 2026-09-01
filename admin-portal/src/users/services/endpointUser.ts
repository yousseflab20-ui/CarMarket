import api from "../../services/api";
import type {
  UsersFilters,
  UsersListResponse,
  PatchUserStatusParams,
} from "../types/user.types";

export const getUsers = async (
  filters: UsersFilters,
): Promise<UsersListResponse> => {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", "20");
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.role !== "ALL") params.set("role", filters.role);

  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
};

export const patchUserStatus = async ({
  userId,
  status,
  reason,
}: PatchUserStatusParams): Promise<void> => {
  await api.put(`/admin/users/${userId}/status`, { status, reason });
};

export const getUserDetails = async (userId: number): Promise<any> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const getUserStatusHistory = async (userId: number): Promise<any> => {
  const response = await api.get(`/admin/users/${userId}/status-history`);
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/admin/user/${userId}`);
};

export const exportUsersCSV = async (
  filters: Omit<UsersFilters, "page">,
): Promise<Blob> => {
  const response = await api.get(`/admin/users/export`, {
    params: filters,
    responseType: "blob",
  });
  return response.data;
};

export const bulkUpdateStatus = async (data: { userIds: number[]; status: "ACTIVE" | "RESTRICTED" | "BLOCKED"; reason?: string }): Promise<void> => {
  await api.put(`/admin/users/bulk-status`, data);
};

export const bulkDeleteUsers = async (userIds: number[]): Promise<void> => {
  await api.delete(`/admin/users/bulk-delete`, { data: { userIds } });
};
