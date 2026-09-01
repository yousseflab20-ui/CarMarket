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
  phone?: string | null;
  verified?: boolean;
  createdAt: string;
  totalReports: number;
  acceptedReports: number;
  strikes: number;
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
  data: {
    users: AdminUser[];
    summary: {
      ACTIVE: number;
      RESTRICTED: number;
      BLOCKED: number;
    };
    pagination: UsersPagination;
  };
}

export interface UsersFilters {
  search: string;
  status: UserStatus | "ALL";
  role: UserRole | "ALL";
  page: number;
}

export interface PatchUserStatusParams {
  userId: number;
  status: UserStatus;
  reason?: string;
}

export interface UserCar {
  id: number;
  brand: string;
  model: string;
  price: number;
  status: string;
  isHidden: boolean;
  images: string;
  createdAt: string;
}

export interface UserReport {
  id: number;
  reason: string;
  targetType: string;
  targetId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export interface UserDetailsResponse {
  success: boolean;
  data: {
    user: AdminUser;
    risk: {
      totalReports: number;
      acceptedReports: number;  // Raw count for tab badge
      rejectedReports: number;
      pendingReports: number;
      strikes: number;          // Distinct targets — used for riskLevel & badge
      riskLevel: RiskLevel;
    };
    reports: UserReport[];
    cars: UserCar[];
  };
}

export interface UserStatusHistoryRecord {
  id: number;
  userId: number;
  adminId: number;
  oldStatus: UserStatus;
  newStatus: UserStatus;
  reason: string;
  createdAt: string;
  admin: {
    id: number;
    name: string;
    email: string;
    photo: string | null;
  };
}

export interface UserStatusHistoryResponse {
  success: boolean;
  history: UserStatusHistoryRecord[];
}
