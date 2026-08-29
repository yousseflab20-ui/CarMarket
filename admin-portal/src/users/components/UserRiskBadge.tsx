import type { RiskLevel } from "../types/user.types";

const config: Record<RiskLevel, { label: string; classes: string }> = {
  LOW:    { label: "Low",    classes: "bg-slate-50 text-slate-500 border-slate-200" },
  MEDIUM: { label: "Medium", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  HIGH:   { label: "High",   classes: "bg-red-50 text-red-700 border-red-200" },
};

export const UserRiskBadge = ({ risk, strikes }: { risk: RiskLevel; strikes: number }) => {
  const c = config[risk] ?? config.LOW;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.classes}`}>
      {c.label}
      <span className="opacity-60">({strikes})</span>
    </span>
  );
};
