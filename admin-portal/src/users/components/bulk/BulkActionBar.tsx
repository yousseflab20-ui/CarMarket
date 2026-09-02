import { useState, useEffect } from "react";
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
  // Bar state
  const [barState, setBarState] = useState<"closed" | "opening" | "closing">("closed");
  const [displayCount, setDisplayCount] = useState(selectedCount);

  // Menu state
  const [menuState, setMenuState] = useState<"closed" | "opening" | "closing">("closed");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Sync bar state with selectedCount changes
  useEffect(() => {
    if (selectedCount > 0) {
      setDisplayCount(selectedCount);
      setBarState("opening");
    } else if (selectedCount === 0 && barState === "opening") {
      setBarState("closing");
      setMenuState("closed"); // force close menu if open
      setConfirmingDelete(false); // force reset delete confirm
    }
  }, [selectedCount, barState]);

  const isPending = isPendingStatus || isPendingDelete;
  const menuOpen = menuState === "opening";
  const menuInDom = menuState !== "closed";

  const openMenu = () => setMenuState("opening");
  const closeMenu = () => setMenuState((s) => (s === "opening" ? "closing" : s));
  const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

  const handleMenuAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "bulkActionMenuOut") setMenuState("closed");
  };

  const handleBarAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "bulkActionBarOut") setBarState("closed");
  };

  if (barState === "closed" || typeof document === "undefined") return null;

  const handleStatusPick = (status: UserStatus) => {
    closeMenu();
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
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90]"
      style={{ perspective: "1000px" }}
    >
      <style>{`
        @keyframes bulkActionBarIn {
          0% { opacity: 0; transform: translateY(40px) scale(0.95) rotateX(10deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); }
        }
        @keyframes bulkActionBarOut {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        @keyframes bulkActionMenuIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bulkActionMenuOut {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.95) translateY(5px); }
        }
        
        .bulk-bar-enter {
          animation: bulkActionBarIn 400ms cubic-bezier(0.2, 1.2, 0.4, 1) forwards;
        }
        .bulk-bar-exit {
          animation: bulkActionBarOut 200ms cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        .bulk-menu-enter {
          animation: bulkActionMenuIn 250ms cubic-bezier(0.2, 1, 0.4, 1) forwards;
        }
        .bulk-menu-exit {
          animation: bulkActionMenuOut 150ms cubic-bezier(0.4, 0, 1, 1) forwards;
        }
      `}</style>

      <div
        role="toolbar"
        aria-label="Bulk user actions"
        onAnimationEnd={handleBarAnimationEnd}
        className={`flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl px-5 py-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] border border-slate-700/60 ring-1 ring-white/10 ${
          barState === "closing" ? "bulk-bar-exit" : "bulk-bar-enter"
        }`}
      >
        {/* Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/60">
          <div className="w-5 h-5 rounded-full bg-blue-500 shadow-inner shadow-white/20 flex items-center justify-center text-[10px] font-black">
            {displayCount}
          </div>
          <span className="text-sm font-bold text-slate-200 whitespace-nowrap drop-shadow-sm">
            {displayCount === 1 ? "user selected" : "users selected"}
          </span>
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={toggleMenu}
            disabled={isPending}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              menuOpen ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isPendingStatus ? (
              <Loader2 size={15} className="animate-spin text-slate-400" />
            ) : (
              <ShieldCheck size={15} className={menuOpen ? "text-white" : "text-slate-400"} />
            )}
            Change status
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ease-in-out ${
                menuOpen ? "rotate-180 text-white" : "text-slate-400"
              }`}
            />
          </button>

          {menuInDom && (
            <>
              {/* Click-catcher */}
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div
                role="menu"
                onAnimationEnd={handleMenuAnimationEnd}
                className={`absolute bottom-[calc(100%+12px)] left-0 z-20 w-52 origin-bottom-left bg-slate-800/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl py-1.5 overflow-hidden ${
                  menuState === "closing"
                    ? "bulk-menu-exit"
                    : "bulk-menu-enter"
                }`}
              >
                {STATUS_OPTIONS.map(
                  ({ value, label, icon: Icon, color, hoverBg }) => (
                    <button
                      key={value}
                      role="menuitem"
                      onClick={() => handleStatusPick(value)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold text-slate-200 ${hoverBg} transition-all`}
                    >
                      <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>
                        <Icon size={14} strokeWidth={2.5} />
                      </div>
                      {label}
                    </button>
                  ),
                )}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-slate-700/60 mx-1" />

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          disabled={isPending}
          className={`flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            confirmingDelete
              ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
              : "text-red-400 hover:text-red-300 hover:bg-red-400/10"
          }`}
        >
          {isPendingDelete ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} className={confirmingDelete ? "text-white" : ""} />
          )}
          {confirmingDelete ? "Confirm" : "Delete"}
        </button>

        <div className="w-px h-6 bg-slate-700/60 mx-1" />

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          aria-label="Clear selection"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-200"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>,
    document.body
  );
};
