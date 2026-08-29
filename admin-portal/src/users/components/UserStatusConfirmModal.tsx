import { AlertTriangle, Loader2, ShieldBan, ShieldCheck, ShieldAlert } from "lucide-react";
import type { AdminUser, UserStatus } from "../types/user.types";
import { UserStatusBadge } from "./UserStatusBadge";

interface Props {
  user: AdminUser;
  targetStatus: UserStatus;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

const actionConfig: Record<UserStatus, {
  title: string;
  description: string;
  buttonLabel: string;
  buttonClass: string;
  icon: React.ReactNode;
}> = {
  ACTIVE: {
    title: "Reactivate this user?",
    description: "The user will regain full access to the platform.",
    buttonLabel: "Reactivate",
    buttonClass: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30",
    icon: <ShieldCheck size={20} />,
  },
  RESTRICTED: {
    title: "Restrict this user?",
    description: "The user will have limited access to platform features.",
    buttonLabel: "Restrict User",
    buttonClass: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30",
    icon: <ShieldAlert size={20} />,
  },
  BLOCKED: {
    title: "Block this user?",
    description: "This will prevent the user from logging in or taking any action on the platform.",
    buttonLabel: "Block User",
    buttonClass: "bg-red-500 hover:bg-red-600 shadow-red-500/30",
    icon: <ShieldBan size={20} />,
  },
};

export const UserStatusConfirmModal = ({ user, targetStatus, onConfirm, onCancel, isPending }: Props) => {
  const action = actionConfig[targetStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <AlertTriangle size={20} className="text-slate-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{action.title}</h3>
            <p className="text-xs text-slate-500 font-medium truncate">{user.name} · {user.email}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-xs text-slate-500 font-bold uppercase">Current status</span>
            <UserStatusBadge status={user.status} />
            <span className="text-slate-300">→</span>
            <UserStatusBadge status={targetStatus} />
          </div>
          <p className="text-sm text-slate-600">{action.description}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex gap-3 justify-end border-t border-slate-100">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-md transition-all active:translate-y-0.5 disabled:opacity-50 ${action.buttonClass}`}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : action.icon}
            {isPending ? "Processing..." : action.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
