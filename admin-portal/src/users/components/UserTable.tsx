import { useState, useEffect, useRef } from "react";
import { User as UserIcon, Mail, Shield, ChevronDown, Eye, ShieldCheck, ShieldAlert, ShieldBan } from "lucide-react";
import type { AdminUser, UserStatus } from "../types/user.types";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRiskBadge } from "./UserRiskBadge";
import { SelectableHeaderAvatar, SelectableRowAvatar } from "./bulk/SelectableAvatar";

interface Props {
  users: AdminUser[];
  onChangeStatus: (user: AdminUser, targetStatus: UserStatus) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleAll: () => void;
}

const STATUS_OPTIONS: { label: string; value: UserStatus; icon: React.ReactNode; color: string }[] = [
  { label: "Activate",  value: "ACTIVE",      icon: <ShieldCheck size={13} />,  color: "text-emerald-500" },
  { label: "Restrict",  value: "RESTRICTED",  icon: <ShieldAlert size={13} />,  color: "text-amber-500"   },
  { label: "Block",     value: "BLOCKED",     icon: <ShieldBan   size={13} />,  color: "text-red-500"     },
];

const ActionsDropdown = ({ user, onChangeStatus }: { user: AdminUser; onChangeStatus: Props["onChangeStatus"] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        Actions <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="fixed"
          style={{
            zIndex: 9999,
            top: ref.current ? ref.current.getBoundingClientRect().bottom + 10 : 0,
            left: ref.current ? ref.current.getBoundingClientRect().right - 164 : 0,
            minWidth: "164px",
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100">
            <div className="absolute -top-[7px] right-5 w-3.5 h-3.5 bg-white border-l border-t border-slate-100 rotate-45" />
            <div className="p-1.5 flex flex-col gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); onChangeStatus(user, "DETAILS" as any); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Eye size={13} className="text-slate-400" /> View Details
              </button>
              <div className="h-px bg-slate-100 mx-2" />
              {STATUS_OPTIONS.filter((o) => o.value !== user.status).map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => { e.stopPropagation(); setOpen(false); onChangeStatus(user, opt.value); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors hover:bg-slate-50 ${opt.color}`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const UserTable = ({ users, onChangeStatus, selectedIds, onToggleSelect, onToggleAll }: Props) => {
  const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));
  const someSelected = users.some((u) => selectedIds.includes(u.id));

  if (users.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <UserIcon size={32} className="mx-auto mb-3 opacity-30" />
        <p className="font-bold text-sm">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/60">
            {/* Avatar col header — select-all on hover */}
            <th className="pl-6 pr-2 py-3.5 border-b border-slate-100 w-14">
              <SelectableHeaderAvatar 
                allSelected={allSelected} 
                someSelected={someSelected} 
                onToggleAll={onToggleAll} 
              />
            </th>
            {["User", "Role", "Status", "Reports", "Risk", "Actions"].map((h) => (
              <th key={h} className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users.map((user) => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <tr
                key={user.id}
                onClick={() => onChangeStatus(user, "DETAILS" as any)}
                className={`transition-colors group cursor-pointer ${isSelected ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-slate-50/60"}`}
              >
                {/* Gmail-style avatar → checkbox on hover/select */}
                <td className="pl-6 pr-2 py-4">
                  <SelectableRowAvatar 
                    isSelected={isSelected} 
                    photo={user.photo as string | undefined} 
                    name={user.name} 
                    onToggle={() => onToggleSelect(user.id)} 
                  />
                </td>

                {/* User info */}
                <td className="px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                      <Mail size={10} />
                      {user.email}
                    </p>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    user.role === "ADMIN"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>
                    {user.role === "ADMIN" && <Shield size={9} />}
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <UserStatusBadge status={user.status} />
                </td>

                {/* Reports */}
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-700">{user.acceptedReports}</span>
                  <span className="text-xs text-slate-400 ml-1">/ {user.totalReports} total</span>
                </td>

                {/* Risk */}
                <td className="px-6 py-4">
                  <UserRiskBadge risk={user.riskLevel} strikes={user.strikes} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  {user.role === "ADMIN" ? (
                    <span className="text-xs text-slate-300 font-bold italic">Protected</span>
                  ) : (
                    <ActionsDropdown user={user} onChangeStatus={onChangeStatus} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

