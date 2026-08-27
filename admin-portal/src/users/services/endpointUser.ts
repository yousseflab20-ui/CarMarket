import api from "../../services/api";
import type { UsersFilters, UsersListResponse } from "../types/user.types";

export const getUsers = async (filters: UsersFilters): Promise<UsersListResponse> => {
  const params = new URLSearchParams();
  params.set("page",  String(filters.page));
  params.set("limit", "20");
  if (filters.search) params.set("search", filters.search);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.role   !== "ALL") params.set("role",   filters.role);

  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
};

export const patchUserStatus = async ({
  userId,
  status,
}: {
  userId: number;
  status: string;
}): Promise<void> => {
  await api.patch(`/admin/users/${userId}/status`, { status });
};

export const getUserDetails = async (userId: number): Promise<any> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};
