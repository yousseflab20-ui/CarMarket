import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Users as UsersIcon } from "lucide-react";
import { useUsers, useUpdateUserStatus } from "../services/queries";
import { UserTable } from "../components/UserTable";
import { UserStatusConfirmModal } from "../components/UserStatusConfirmModal";
import { UserDetailsDrawer } from "../components/UserDetailsDrawer";
import type { AdminUser, UserStatus, UsersFilters } from "../types/user.types";

const LIMIT = 20;

const Users = () => {
  const [filters, setFilters] = useState<UsersFilters>({
    search: "",
    status: "ACTIVE", // Default to ACTIVE instead of ALL
    role: "ALL",
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [pendingAction, setPendingAction] = useState<{ user: AdminUser; targetStatus: UserStatus } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data, isLoading, isFetching, error } = useUsers(filters);
  const updateStatusMutation = useUpdateUserStatus();

  // Debounce: apply search only on Enter or blur
  const applySearch = () => {
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  const handleChangeStatus = (user: AdminUser, targetStatus: UserStatus | "DETAILS") => {
    if (targetStatus === "DETAILS") {
      setSelectedUserId(user.id);
    } else {
      setPendingAction({ user, targetStatus });
    }
  };

  const confirmStatusChange = (reason?: string) => {
    if (!pendingAction) return;
    updateStatusMutation.mutate(
      { userId: pendingAction.user.id, status: pendingAction.targetStatus, reason },
      { onSuccess: () => setPendingAction(null) }
    );
  };

  const users = data?.data?.users ?? [];
  const pagination = data?.data?.pagination;
  const summary = data?.data?.summary ?? { ACTIVE: 0, RESTRICTED: 0, BLOCKED: 0 };

  const tabColors = {
    ACTIVE: {
      text: "text-emerald-600",
      active: "border-emerald-400 ring-4 ring-emerald-50 bg-emerald-50/30",
    },
    RESTRICTED: {
      text: "text-amber-600",
      active: "border-amber-400 ring-4 ring-amber-50 bg-amber-50/30",
    },
    BLOCKED: {
      text: "text-red-600",
      active: "border-red-400 ring-4 ring-red-50 bg-red-50/30",
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitor user activity, risk levels, and account status.
          </p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-2 shadow-sm min-w-[140px] justify-center">
          <UsersIcon size={16} className="text-blue-500" />
          {isFetching ? (
            <div className="w-6 h-5 bg-slate-200 rounded animate-pulse" />
          ) : (
            <span className="text-sm font-bold text-slate-700">{pagination?.total ?? 0}</span>
          )}
          <span className="text-xs text-slate-400 font-medium">total users</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { label: "Active",     key: "ACTIVE" },
          { label: "Restricted", key: "RESTRICTED" },
          { label: "Blocked",    key: "BLOCKED" },
        ] as const).map(({ label, key }) => (
          <button
            key={key}
            onClick={() => {
              if (filters.status !== key) {
                setFilters((f) => ({ ...f, status: key, page: 1 }));
              }
            }}
            className={`border rounded-2xl px-5 py-4 text-left shadow-sm transition-all hover:shadow-md cursor-pointer ${
              filters.status === key 
                ? tabColors[key].active 
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {isFetching ? (
              <div className="w-12 h-8 bg-slate-200 rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-2xl font-black ${tabColors[key].text}`}>{summary[key]}</p>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl flex-1 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent outline-none text-sm font-medium w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              onBlur={applySearch}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any, page: 1 }))}
            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value as any, page: 1 }))}
            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-44 bg-slate-100 rounded" />
                </div>
                <div className="h-3.5 w-12 bg-slate-200 rounded hidden sm:block" />
                <div className="h-6 w-16 bg-slate-200 rounded-full hidden md:block" />
                <div className="h-3.5 w-10 bg-slate-100 rounded hidden lg:block" />
                <div className="h-3.5 w-14 bg-slate-100 rounded hidden lg:block" />
                <div className="h-8 w-20 bg-slate-200 rounded-xl ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50">
            <p className="font-bold text-sm">Error loading users. Check backend connection.</p>
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <UserTable users={users} onChangeStatus={handleChangeStatus} />
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="text-xs text-slate-400 font-bold">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {pendingAction && typeof document !== "undefined" &&
        createPortal(
          <UserStatusConfirmModal
            user={pendingAction.user}
            targetStatus={pendingAction.targetStatus}
            onConfirm={confirmStatusChange}
            onCancel={() => setPendingAction(null)}
            isPending={updateStatusMutation.isPending}
          />,
          document.body
        )}

      {/* User Details Drawer */}
      {typeof document !== "undefined" && createPortal(
        <UserDetailsDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onChangeStatus={handleChangeStatus}
        />,
        document.body
      )}
    </div>
  );
};

export default Users;
