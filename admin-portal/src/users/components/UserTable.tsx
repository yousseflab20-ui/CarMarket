import { User as UserIcon, Mail, Shield, ChevronDown } from "lucide-react";
import type { AdminUser, UserStatus } from "../types/user.types";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRiskBadge } from "./UserRiskBadge";

interface Props {
  users: AdminUser[];
  onChangeStatus: (user: AdminUser, targetStatus: UserStatus) => void;
}

const STATUS_OPTIONS: { label: string; value: UserStatus }[] = [
  { label: "Activate",  value: "ACTIVE" },
  { label: "Restrict",  value: "RESTRICTED" },
  { label: "Block",     value: "BLOCKED" },
];

export const UserTable = ({ users, onChangeStatus }: Props) => {
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
            {["User", "Role", "Status", "Reports", "Risk", "Actions"].map((h) => (
              <th key={h} className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users.map((user) => (
            <tr 
              key={user.id} 
              onClick={() => onChangeStatus(user, "DETAILS" as any)}
              className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
            >
              {/* User */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {user.photo ? (
                      <img src={user.photo as string} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                      <Mail size={10} />
                      {user.email}
                    </p>
                  </div>
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
                <UserRiskBadge risk={user.riskLevel} strikes={user.acceptedReports} />
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                {user.role === "ADMIN" ? (
                  <span className="text-xs text-slate-300 font-bold italic">Protected</span>
                ) : (
                  <div className="relative group/dropdown inline-block">
                    <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                      Actions <ChevronDown size={12} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-10 min-w-[140px] overflow-hidden opacity-0 scale-95 group-hover/dropdown:opacity-100 group-hover/dropdown:scale-100 transition-all origin-top-right pointer-events-none group-hover/dropdown:pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeStatus(user, "DETAILS" as any);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50"
                      >
                        View Details
                      </button>
                      {STATUS_OPTIONS.filter((o) => o.value !== user.status).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeStatus(user, opt.value);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${
                            opt.value === "BLOCKED" ? "text-red-600"
                            : opt.value === "RESTRICTED" ? "text-amber-600"
                            : "text-emerald-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
