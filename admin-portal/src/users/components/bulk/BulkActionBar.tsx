import { createPortal } from "react-dom";
import { ShieldBan, ShieldAlert, ShieldCheck, Trash2, X, Loader2 } from "lucide-react";
import type { UserStatus } from "../../types/user.types";

interface Props {
  selectedCount: number;
  isPendingStatus: boolean;
  isPendingDelete: boolean;
  onBulkStatus: (status: UserStatus, reason: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActionBar = ({
  selectedCount,
  isPendingStatus,
  isPendingDelete,
  onBulkStatus,
  onBulkDelete,
  onClearSelection,
}: Props) => {
  if (selectedCount === 0 || typeof document === "undefined") return null;

  const isPending = isPendingStatus || isPendingDelete;

  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl shadow-slate-900/30 border border-slate-700">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black">
            {selectedCount}
          </div>
          <span className="text-sm font-bold text-slate-200">selected</span>
        </div>

        <button
          onClick={() => onBulkStatus("ACTIVE", "Bulk activation by admin")}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <ShieldCheck size={14} /> Activate
        </button>

        <button
          onClick={() => onBulkStatus("RESTRICTED", "Bulk restriction by admin")}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <ShieldAlert size={14} /> Restrict
        </button>

        <button
          onClick={() => onBulkStatus("BLOCKED", "Bulk block by admin")}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <ShieldBan size={14} /> Block
        </button>

        <div className="w-px h-5 bg-slate-700" />

        <button
          onClick={onBulkDelete}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {isPendingDelete ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete
        </button>

        <div className="w-px h-5 bg-slate-700" />

        <button
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
};
