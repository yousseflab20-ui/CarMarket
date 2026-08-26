import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Loader2, Users as UsersIcon } from "lucide-react";
import { useUsers, useUpdateUserStatus } from "../services/queries";
import { UserTable } from "../components/UserTable";
import { UserStatusConfirmModal } from "../components/UserStatusConfirmModal";
import type { AdminUser, UserStatus, UsersFilters } from "../types/user.types";

const LIMIT = 20;

const Users = () => {
  const [filters, setFilters] = useState<UsersFilters>({
    search: "",
    status: "ALL",
    role: "ALL",
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [pendingAction, setPendingAction] = useState<{ user: AdminUser; targetStatus: UserStatus } | null>(null);

  const { data, isLoading, error } = useUsers(filters);
  const updateStatusMutation = useUpdateUserStatus();

  // Debounce: apply search only on Enter or blur
  const applySearch = () => {
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  const handleChangeStatus = (user: AdminUser, targetStatus: UserStatus) => {
    setPendingAction({ user, targetStatus });
  };

  const confirmStatusChange = () => {
    if (!pendingAction) return;
    updateStatusMutation.mutate(
      { userId: pendingAction.user.id, status: pendingAction.targetStatus },
      { onSuccess: () => setPendingAction(null) }
    );
  };

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const statusCounts = {
    ACTIVE:     users.filter((u) => u.status === "ACTIVE").length,
    RESTRICTED: users.filter((u) => u.status === "RESTRICTED").length,
    BLOCKED:    users.filter((u) => u.status === "BLOCKED").length,
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
        {pagination && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-2 shadow-sm">
            <UsersIcon size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-slate-700">{pagination.total}</span>
            <span className="text-xs text-slate-400 font-medium">total users</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { label: "Active",     key: "ACTIVE",     color: "emerald" },
          { label: "Restricted", key: "RESTRICTED", color: "amber" },
          { label: "Blocked",    key: "BLOCKED",    color: "red" },
        ] as const).map(({ label, key, color }) => (
          <button
            key={key}
            onClick={() => setFilters((f) => ({ ...f, status: f.status === key ? "ALL" : key, page: 1 }))}
            className={`bg-white border rounded-2xl px-5 py-4 text-left shadow-sm transition-all hover:shadow-md ${
              filters.status === key ? `border-${color}-300 ring-2 ring-${color}-200` : "border-slate-100"
            }`}
          >
            <p className={`text-2xl font-black text-${color}-600`}>{statusCounts[key]}</p>
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
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50">
            <p className="font-bold text-sm">Error loading users. Check backend connection.</p>
          </div>
        ) : (
          <UserTable users={users} onChangeStatus={handleChangeStatus} />
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
    </div>
  );
};

export default Users;
