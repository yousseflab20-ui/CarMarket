import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldBan,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import type { UserStatus } from "../../types/user.types";

interface Props {
  selectedCount: number;
  isPendingStatus: boolean;
  isPendingDelete: boolean;
  onBulkStatusClick: (status: UserStatus) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const STATUS_OPTIONS: {
  value: UserStatus;
  label: string;
  icon: typeof ShieldCheck;
  color: string;
  hoverBg: string;
}[] = [
  {
    value: "ACTIVE",
    label: "Activate",
    icon: ShieldCheck,
    color: "text-emerald-400",
    hoverBg: "hover:bg-emerald-500/10",
  },
  {
    value: "RESTRICTED",
    label: "Restrict",
    icon: ShieldAlert,
    color: "text-amber-400",
    hoverBg: "hover:bg-amber-500/10",
  },
  {
    value: "BLOCKED",
    label: "Block",
    icon: ShieldBan,
    color: "text-red-400",
    hoverBg: "hover:bg-red-500/10",
  },
];

export const BulkActionBar = ({
  selectedCount,
  isPendingStatus,
  isPendingDelete,
  onBulkStatusClick,
  onBulkDelete,
  onClearSelection,
}: Props) => {
  const [mounted, setMounted] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPending = isPendingStatus || isPendingDelete;

  // Mount transition (bar rises into place instead of popping in)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Close the status dropdown on outside click or Escape
  useEffect(() => {
    if (!statusMenuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStatusMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [statusMenuOpen]);

  // Auto-disarm the delete confirmation if the admin doesn't follow up
  useEffect(() => {
    if (!confirmingDelete) return;
    confirmTimeout.current = setTimeout(() => setConfirmingDelete(false), 3000);
    return () => {
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
    };
  }, [confirmingDelete]);

  if (selectedCount === 0 || typeof document === "undefined") return null;

  const handleStatusPick = (status: UserStatus) => {
    setStatusMenuOpen(false);
    onBulkStatusClick(status);
  };

  const handleDeleteClick = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setConfirmingDelete(false);
    onBulkDelete();
  };

  return createPortal(
    <div
      className={`fixed bottom-6 left-1/2 z-50 transition-all duration-300 ease-out ${
        mounted
          ? "opacity-100 -translate-x-1/2 translate-y-0"
          : "opacity-0 -translate-x-1/2 translate-y-3"
      }`}
    >
      <div
        role="toolbar"
        aria-label="Bulk user actions"
        className="flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl shadow-slate-900/30 border border-slate-700"
      >
        {/* Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-slate-300 whitespace-nowrap">
            {selectedCount === 1 ? "user selected" : "users selected"}
          </span>
        </div>

        {/* Status dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setStatusMenuOpen((open) => !open)}
            disabled={isPending}
            aria-haspopup="menu"
            aria-expanded={statusMenuOpen}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-200 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPendingStatus ? (
              <Loader2 size={15} className="animate-spin text-slate-400" />
            ) : (
              <ShieldCheck size={15} className="text-slate-400" />
            )}
            Change status
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-150 ${
                statusMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {statusMenuOpen && (
            <div
              role="menu"
              className="absolute bottom-full mb-2 left-0 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/40 py-1.5 overflow-hidden"
            >
              {STATUS_OPTIONS.map(
                ({ value, label, icon: Icon, color, hoverBg }) => (
                  <button
                    key={value}
                    role="menuitem"
                    onClick={() => handleStatusPick(value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-200 ${hoverBg} transition-colors`}
                  >
                    <Icon size={15} className={color} />
                    {label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-700/80 mx-1" />

        {/* Delete — click once to arm, click again to confirm */}
        <button
          onClick={handleDeleteClick}
          disabled={isPending}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            confirmingDelete
              ? "bg-red-500/15 text-red-300"
              : "text-red-400 hover:text-red-300 hover:bg-white/10"
          }`}
        >
          {isPendingDelete ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
          {confirmingDelete ? "Confirm delete?" : "Delete"}
        </button>

        <div className="w-px h-5 bg-slate-700/80 mx-1" />

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          aria-label="Clear selection"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body,
  );
};
