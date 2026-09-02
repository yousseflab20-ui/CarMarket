import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Users as UsersIcon, Download, Loader2, ChevronDown, FileText, Database } from "lucide-react";
import { useUsers, useUpdateUserStatus, useExportUsers, useBulkUpdateStatus, useBulkDeleteUsers } from "../services/queries";
import { UserTable } from "../components/UserTable";
import { UserStatusConfirmModal } from "../components/UserStatusConfirmModal";
import { UserDetailsDrawer } from "../components/UserDetailsDrawer";
import { BulkActionBar } from "../components/bulk/BulkActionBar";
import { BulkStatusConfirmModal } from "../components/bulk/BulkStatusConfirmModal";
import type { AdminUser, UserStatus, UsersFilters } from "../types/user.types";

const LIMIT = 20;

const Users = () => {
  const [filters, setFilters] = useState<UsersFilters>({
    search: "",
    status: "ACTIVE",
    role: "ALL",
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [pendingAction, setPendingAction] = useState<{ user: AdminUser; targetStatus: UserStatus } | null>(null);
  const [pendingBulkAction, setPendingBulkAction] = useState<UserStatus | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isLoading, isFetching, error } = useUsers(filters);
  const updateStatusMutation = useUpdateUserStatus();
  const exportMutation = useExportUsers();
  const bulkStatusMutation = useBulkUpdateStatus(() => setSelectedIds([]));
  const bulkDeleteMutation = useBulkDeleteUsers(() => setSelectedIds([]));

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

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    const pageIds = users.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !pageIds.includes(id)) : [...new Set([...selectedIds, ...pageIds])]);
  };

  const confirmStatusChange = (reason?: string) => {
    if (!pendingAction) return;
    updateStatusMutation.mutate(
      { userId: pendingAction.user.id, status: pendingAction.targetStatus, reason },
      { onSuccess: () => setPendingAction(null) }
    );
  };

  const confirmBulkStatusChange = (reason?: string) => {
    if (!pendingBulkAction) return;
    bulkStatusMutation.mutate(
      { userIds: selectedIds, status: pendingBulkAction, reason },
      { onSuccess: () => setPendingBulkAction(null) }
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

          {/* Export Dropdown */}
          <div className="relative shrink-0" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 bg-slate-900 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-md hover:bg-slate-800 transition-all disabled:opacity-60"
            >
              {exportMutation.isPending ? <Loader2 size={16} className="animate-spin text-slate-300" /> : <Download size={16} />}
              Export Excel
              <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Export Options</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    exportMutation.mutate({ search: filters.search, status: filters.status, role: filters.role });
                  }}
                  className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Current View</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Export {pagination?.total ?? 0} filtered users</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    exportMutation.mutate({ search: "", status: "ALL", role: "ALL" });
                  }}
                  className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <Database size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-600">All Database</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Export every user in system</p>
                  </div>
                </button>
              </div>
            )}
          </div>
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
            <UserTable
              users={users}
              onChangeStatus={handleChangeStatus}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleAll={handleToggleAll}
            />
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
                ← Prev
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <BulkActionBar
        selectedCount={selectedIds.length}
        isPendingStatus={bulkStatusMutation.isPending}
        isPendingDelete={bulkDeleteMutation.isPending}
        onBulkStatusClick={(status) => setPendingBulkAction(status)}
        onBulkDelete={() => bulkDeleteMutation.mutate(selectedIds)}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Single User Confirm Modal */}
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

      {/* Bulk Action Confirm Modal */}
      {pendingBulkAction && typeof document !== "undefined" &&
        createPortal(
          <BulkStatusConfirmModal
            selectedCount={selectedIds.length}
            targetStatus={pendingBulkAction}
            onConfirm={confirmBulkStatusChange}
            onCancel={() => setPendingBulkAction(null)}
            isPending={bulkStatusMutation.isPending}
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
