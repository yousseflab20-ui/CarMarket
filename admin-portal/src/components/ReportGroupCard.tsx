import {
  Car,
  User as UserIcon,
  Handshake,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import type { ReportGroup } from "../types/Reports/ReportType";

// ── Config ───────────────────────────────────────────────
const typeConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  CAR:         { label: "Car",         icon: <Car size={13} />,       classes: "bg-blue-50 text-blue-700 border-blue-200" },
  USER:        { label: "User",        icon: <UserIcon size={13} />,  classes: "bg-purple-50 text-purple-700 border-purple-200" },
  NEGOTIATION: { label: "Negotiation", icon: <Handshake size={13} />, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  POST:        { label: "Post",        icon: <FileText size={13} />,  classes: "bg-slate-50 text-slate-700 border-slate-200" },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  PENDING:  { label: "Pending",  icon: <Clock size={11} />,        classes: "bg-amber-50 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Accepted", icon: <CheckCircle2 size={11} />, classes: "bg-teal-50 text-teal-700 border-teal-200" },
  REJECTED: { label: "Rejected", icon: <XCircle size={11} />,      classes: "bg-red-50 text-red-600 border-red-200" },
  REVIEWED: { label: "Reviewed", icon: <CheckCircle2 size={11} />, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ── Props ────────────────────────────────────────────────
interface Props {
  group: ReportGroup;
  onViewSingle: (reportId: number) => void;
  onBulkAction: (group: ReportGroup, status: "ACCEPTED" | "REJECTED") => void;
}

// ── Component ────────────────────────────────────────────
export const ReportGroupCard = ({ group, onViewSingle, onBulkAction }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const type   = typeConfig[group.targetType]   ?? { label: group.targetType,   icon: null, classes: "bg-slate-50 text-slate-600 border-slate-200" };
  const status = statusConfig[group.groupStatus] ?? { label: group.groupStatus, icon: null, classes: "bg-slate-50 text-slate-600 border-slate-200" };
  const isBulk = group.reports.length > 1;

  const targetLabel =
    group.targetType === "NEGOTIATION"
      ? group.targetData?.Car?.title ?? group.targetData?.car?.title ?? "Negotiation Deal"
      : group.targetData?.title ?? group.targetData?.name ?? `Target #${group.targetId}`;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md ${isBulk ? "border-amber-200 shadow-amber-50" : "border-slate-100"}`}>
      {/* ── Header ── */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Multi-report badge */}
          {isBulk && (
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
              <AlertTriangle size={11} />
              {group.reports.length} Reports
            </div>
          )}

          {/* Type badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${type.classes} shrink-0`}>
            {type.icon}
            {type.label}
          </span>

          {/* Target info */}
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{targetLabel}</p>
            <p className="text-xs text-slate-400">ID #{group.targetId} · {formatDate(group.latestAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.classes}`}>
            {status.icon}
            {status.label}
          </span>

          {/* Bulk actions — multiple reports */}
          {isBulk && group.groupStatus === "PENDING" && (
            <>
              <button
                onClick={() => onBulkAction(group, "ACCEPTED")}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ✓ Accept All
              </button>
              <button
                onClick={() => onBulkAction(group, "REJECTED")}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ✗ Reject All
              </button>
            </>
          )}

          {/* Single report actions */}
          {!isBulk && group.groupStatus === "PENDING" && (
            <>
              <button
                onClick={() => onBulkAction(group, "ACCEPTED")}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ✓ Accept
              </button>
              <button
                onClick={() => onBulkAction(group, "REJECTED")}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ✗ Reject
              </button>
            </>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Expanded list of individual reports ── */}
      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {group.reports.map((report) => {
            const rStatus = statusConfig[report.status] ?? { label: report.status, icon: null, classes: "bg-slate-50 text-slate-600 border-slate-200" };
            return (
              <div
                key={report.id}
                className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Reporter avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-[10px] font-bold overflow-hidden">
                    {report.reporter?.photo ? (
                      <img src={report.reporter.photo} alt={report.reporter.name} className="w-full h-full object-cover" />
                    ) : (
                      report.reporter?.name?.charAt(0) ?? "?"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {report.reporter?.name ?? "Unknown"} — <span className="text-slate-500 font-normal">{report.reason}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">{formatDate(report.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${rStatus.classes}`}>
                    {rStatus.icon}
                    {rStatus.label}
                  </span>
                  <button
                    onClick={() => onViewSingle(report.id)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
