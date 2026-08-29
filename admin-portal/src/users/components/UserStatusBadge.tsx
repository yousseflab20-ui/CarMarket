import type { UserStatus } from "../types/user.types";

const config: Record<UserStatus, { label: string; dot: string; classes: string }> = {
  ACTIVE:     { label: "Active",     dot: "bg-emerald-500", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  RESTRICTED: { label: "Restricted", dot: "bg-amber-500",   classes: "bg-amber-50 text-amber-700 border-amber-200" },
  BLOCKED:    { label: "Blocked",    dot: "bg-red-500",     classes: "bg-red-50 text-red-700 border-red-200" },
};

export const UserStatusBadge = ({ status }: { status: UserStatus }) => {
  const c = config[status] ?? config.ACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};
