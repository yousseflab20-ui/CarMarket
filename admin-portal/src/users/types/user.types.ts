export type UserStatus = "ACTIVE" | "RESTRICTED" | "BLOCKED";
export type UserRole = "USER" | "ADMIN";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  role: UserRole;
  status: UserStatus;
  city?: string | null;
  createdAt: string;
  totalReports: number;
  acceptedReports: number;
  riskLevel: RiskLevel;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersListResponse {
  success: boolean;
  users: AdminUser[];
  pagination: UsersPagination;
}

export interface UsersFilters {
  search: string;
  status: UserStatus | "ALL";
  role: UserRole | "ALL";
  page: number;
}
