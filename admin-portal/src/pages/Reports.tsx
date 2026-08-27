import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Search,
  Flag,
  Car,
  User as UserIcon,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  X,
  AlertTriangle,
  ChevronDown,
  MessageSquare,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Play,
  Handshake,
  TrendingUp,
} from "lucide-react";
import type {
  Report,
  ReportGroup,
  StatusConfigItem,
  TypeConfigItem,
} from "../types/Reports/ReportType";
import {
  getReport,
  updateReport,
  deletReport,
  updateBulkReports,
} from "../services/Report/endpointReport";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/react-query";
import { getRiskLevel } from "../components/RiskLevelBadge";
import { useReportGroups } from "../hooks/useReportGroups";
import { ReportGroupCard } from "../components/ReportGroupCard";
const statusConfig: Record<string, StatusConfigItem> = {
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <Clock size={11} />,
  },
  REVIEWED: {
    label: "Reviewed",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <CheckCircle2 size={11} />,
  },
  ACCEPTED: {
    label: "Accepted",
    classes: "bg-teal-50 text-teal-700 border border-teal-200",
    icon: <CheckCircle2 size={11} />,
  },
  REJECTED: {
    label: "Rejected",
    classes: "bg-red-50 text-red-600 border border-red-200",
    icon: <XCircle size={11} />,
  },
};
const isVideo = (url: string) => {
  if (!url) return false;
  return /\.(mp4|mov|webm|mkv)$/i.test(url) || url.includes("/video/upload/");
};
console.log("isVideo", isVideo("https://test.mp4"));
const typeConfig: Record<string, TypeConfigItem> = {
  CAR: {
    classes: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <Car size={11} />,
  },
  USER: {
    classes: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: <UserIcon size={11} />,
  },
  POST: {
    classes: "bg-slate-50 text-slate-700 border border-slate-200",
    icon: <FileText size={11} />,
  },
  NEGOTIATION: {
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <Handshake size={11} />,
  },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Reports = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>(
    {},
  );
  const [reporterMessageInput, setReporterMessageInput] = useState("");
  const [reportedMessageInput, setReportedMessageInput] = useState("");
  const [takedownContent, setTakedownContent] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<{ group: ReportGroup; status: "ACCEPTED" | "REJECTED" } | null>(null);

  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: getReport,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: deletReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setSelectedReport(null);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: updateBulkReports,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const reports: Report[] = (reportsData ?? []).map((r) => ({
    ...r,
    status: localStatuses[r.id] ?? r.status,
  }));

  const location = useLocation();

  useEffect(() => {
    const state = location.state as { openReportId?: number } | null;
    if (!state?.openReportId) return;

    // Clear state immediately to prevent re-running
    navigate('.', { replace: true, state: null });

    if (reportsData && reportsData.length > 0) {
      const targetReport = reportsData.find((r) => r.id === state.openReportId);
      if (targetReport) {
        setSelectedReport({
          ...targetReport,
          status: localStatuses[targetReport.id] ?? targetReport.status,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // ⚠️ All hooks must be called before any early return (Rules of Hooks)
  const filtered = reports.filter((r) => {
    const matchSearch =
      (r.reporter?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.targetData?.title || r.targetData?.name || `ID #${r.targetId}`)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (r.reason || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchType = typeFilter === "ALL" || r.targetType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  // Auto-group reports by targetId — custom hook (must stay before early returns)
  const groupedReports = useReportGroups(filtered);

  if (isLoading && !reportsData)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
        <p className="font-bold">
          Error loading reports. Please check if the backend is running.
        </p>
      </div>
    );


  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  // Handle bulk accept/reject for a group
  const onBulkAction = (group: ReportGroup, status: "ACCEPTED" | "REJECTED") => {
    setPendingBulkAction({ group, status });
    setReporterMessageInput("");
    setReportedMessageInput("");
    setTakedownContent(false);
  };

  const confirmBulkAction = () => {
    if (!pendingBulkAction) return;
    bulkUpdateMutation.mutate({
      reportIds: pendingBulkAction.group.reports.map((r) => r.id),
      status: pendingBulkAction.status,
      reporterMessage: reporterMessageInput,
      reportedMessage: reportedMessageInput,
      takedownContent: takedownContent,
    });
    setPendingBulkAction(null);
  };

  // Open detail panel for a single report
  const onViewSingle = (reportId: number) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    setSelectedReport(report);
    setActiveMediaIndex(0);
    setReporterMessageInput(report.reporterMessage || "");
    setReportedMessageInput(report.reportedMessage || "");
    setTakedownContent((report.targetData as any)?.isHidden ?? false);
  };

  // Update local status optimistically so the badge changes instantly in the UI
  const handleStatusChange = (reportId: number, status: string) => {
    setLocalStatuses((prev) => ({ ...prev, [reportId]: status }));
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => prev ? { ...prev, status: status as Report["status"] } : prev);
    }
  };

  const previousViolations = selectedReport?.previousViolations ?? 0;

  const risk = getRiskLevel(previousViolations);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 text-white">
              <Flag size={24} strokeWidth={2.5} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Reports Management
            </span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-2">
            Review and manage reports submitted by users.
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 shadow-[0_4px_15px_rgba(251,191,36,0.2)] text-amber-700 px-5 py-3 rounded-2xl text-sm font-bold animate-in slide-in-from-right-4">
            <AlertTriangle size={18} className="text-amber-500 animate-pulse" />
            {pendingCount} report{pendingCount > 1 ? "s" : ""} awaiting review
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Reports",
            value: reports.length,
            color: "from-slate-700 to-slate-900",
            shadow: "shadow-slate-500/30",
            sub: "All time",
          },
          {
            label: "Pending",
            value: reports.filter((r) => r.status === "PENDING").length,
            color: "from-amber-400 to-orange-500",
            shadow: "shadow-orange-500/30",
            sub: "Need action",
          },
          {
            label: "Reviewed",
            value: reports.filter((r) => r.status === "REVIEWED").length,
            color: "from-emerald-500 to-teal-400",
            shadow: "shadow-emerald-500/30",
            sub: "Resolved",
          },
          {
            label: "Rejected",
            value: reports.filter((r) => r.status === "REJECTED").length,
            color: "from-red-500 to-rose-500",
            shadow: "shadow-red-500/30",
            sub: "Dismissed",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
          >
            <div
              className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}
            ></div>

            <div className="relative z-10">
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                {stat.value}
              </p>
              <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between relative z-10 border-t border-slate-100/60 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {stat.sub}
              </p>
              <div
                className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md ${stat.shadow} group-hover:rotate-3 group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.label === "Total Reports" ? (
                  <FileText size={14} className="text-white" />
                ) : stat.label === "Pending" ? (
                  <Clock size={14} className="text-white" />
                ) : stat.label === "Reviewed" ? (
                  <CheckCircle2 size={14} className="text-white" />
                ) : (
                  <XCircle size={14} className="text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
          {/* Search */}
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-slate-200 px-4 py-2.5 rounded-2xl w-full md:w-80 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 focus-within:border-blue-300 group">
            <Search
              size={18}
              className="text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search reporter, target, reason..."
              className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700 placeholder-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase">
                Filter:
              </span>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 pl-3 pr-7 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 pl-3 pr-7 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="ALL">All Types</option>
                <option value="CAR">Car</option>
                <option value="USER">User</option>
                <option value="POST">Post</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Grouped Report Cards */}
        <div className="p-5 space-y-3">
          {groupedReports.length === 0 && (
            <div className="py-16 text-center">
              <Flag size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-400">No reports found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {groupedReports.map((group) => (
            <ReportGroupCard
              key={group.key}
              group={group}
              onViewSingle={onViewSingle}
              onBulkAction={onBulkAction}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-xs text-slate-400 font-bold">
            Showing {groupedReports.length} group{groupedReports.length !== 1 ? "s" : ""} · {filtered.length} total reports
          </p>
        </div>
      </div>

      {/* ── Detail Modal (Creative Redesign) ── */}
      {selectedReport &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className={`bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-white/50 w-[98%] max-h-[92vh] overflow-hidden flex flex-col ${selectedReport.targetType === "CAR" && selectedReport.targetData ? "md:flex-row max-w-5xl" : "max-w-2xl"} animate-in zoom-in-95 duration-300`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Left Pane: Target Profile (Only for Cars) ── */}
              {selectedReport.targetType === "CAR" &&
                selectedReport.targetData && (
                  <div className="w-full md:w-[45%] bg-slate-900 text-white relative overflow-hidden flex flex-col shrink-0 min-h-[300px] md:min-h-0">
                    {/* Blurred Background */}
                    <div className="absolute inset-0 z-0">
                      {/* <img
                        src={
                          selectedReport.targetData.images?.[0] ||
                          "https://images.unsplash.com/photo-1542282088-fe8426682b8f"
                        }
                        className="w-full h-full object-cover opacity-30 blur-2xl scale-125"
                        alt="bg blur"
                      /> */}
                      {isVideo(selectedReport.targetData.images?.[0]) ? (
                        <video
                          src={selectedReport.targetData.images?.[0]}
                          className="w-full h-full object-cover opacity-30 blur-2xl scale-125"
                          autoPlay
                          muted
                          loop
                        />
                      ) : (
                        <img
                          src={
                            selectedReport.targetData.images?.[0] ||
                            "https://images.unsplash.com/photo-1542282088-fe8426682b8f"
                          }
                          className="w-full h-full object-cover opacity-30 blur-2xl scale-125"
                          alt="bg blur"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
                    </div>

                    {/* Badge Bar */}
                    <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
                      <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                        Target Listing
                      </span>
                      <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center backdrop-blur-md border border-red-500/20">
                        <AlertTriangle size={18} />
                      </div>
                    </div>

                    {/* Main Car Profile */}
                    <div className="relative z-10 mt-auto p-6 sm:p-8 space-y-4">
                      {/* Gallery Viewer */}
                      {(() => {
                        const allMedia = selectedReport.targetData.images ?? [];
                        const total = allMedia.length;
                        const current = allMedia[activeMediaIndex];
                        const isVid = current ? isVideo(current) : false;
                        return (
                          <div className="space-y-2">
                            {/* Main Viewer */}
                            <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative group">
                              {current ? (
                                isVid ? (
                                  <video
                                    key={current}
                                    src={current}
                                    className="w-full h-full object-cover"
                                    controls
                                    muted
                                    loop
                                    playsInline
                                  />
                                ) : (
                                  <img
                                    key={current}
                                    src={current}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={selectedReport.targetData.title}
                                  />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                  <Car size={48} className="text-slate-600" />
                                </div>
                              )}

                              {/* Video badge */}
                              {isVid && (
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                                  <Play
                                    size={10}
                                    className="text-white fill-white"
                                  />
                                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                    Video
                                  </span>
                                </div>
                              )}

                              {/* Counter */}
                              {total > 1 && (
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                                  <span className="text-[11px] font-bold text-white">
                                    {activeMediaIndex + 1}/{total}
                                  </span>
                                </div>
                              )}

                              {/* Arrows */}
                              {total > 1 && (
                                <>
                                  <button
                                    onClick={() =>
                                      setActiveMediaIndex(
                                        (i) => (i - 1 + total) % total,
                                      )
                                    }
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <ChevronLeft size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setActiveMediaIndex(
                                        (i) => (i + 1) % total,
                                      )
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Thumbnail Strip */}
                            {total > 1 && (
                              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {allMedia.map((media: string, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveMediaIndex(idx)}
                                    className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                                      idx === activeMediaIndex
                                        ? "border-white/80 scale-105 shadow-lg"
                                        : "border-white/10 opacity-60 hover:opacity-100"
                                    }`}
                                  >
                                    {isVideo(media) ? (
                                      <div className="relative w-full h-full">
                                        <video
                                          src={media}
                                          className="w-full h-full object-cover"
                                          muted
                                          playsInline
                                          preload="metadata"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                          <Play
                                            size={12}
                                            className="text-white fill-white drop-shadow"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        src={media}
                                        className="w-full h-full object-cover"
                                        alt={`media-${idx}`}
                                      />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                            {selectedReport.targetData.title}
                          </h3>
                          <span className="bg-gradient-to-br from-blue-500 to-indigo-600 px-3.5 py-1.5 rounded-xl text-lg sm:text-xl font-black shadow-lg shadow-blue-500/30 flex-shrink-0">
                            ${selectedReport.targetData.pricePerDay}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 mt-1 opacity-80">
                          {selectedReport.targetData.brand} •{" "}
                          {selectedReport.targetData.model} •{" "}
                          {selectedReport.targetData.year}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                        {[
                          selectedReport.targetData.transmission,
                          selectedReport.targetData.fuelType,
                          selectedReport.targetData.city,
                          `${selectedReport.targetData.seats} Seats`,
                        ]
                          .filter(Boolean)
                          .map((badge) => (
                            <span
                              key={badge}
                              className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200"
                            >
                              {badge}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* ── Right Pane: Report Context ── */}
              <div
                className={`flex flex-col bg-slate-50/50 flex-1 overflow-y-auto ${selectedReport.targetType !== "CAR" || !selectedReport.targetData ? "w-full" : ""}`}
              >
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                      <Flag className="text-red-500" size={20} />
                      Report Protocol
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider hidden sm:block">
                      SYS-ID #{selectedReport.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this report? This action cannot be undone.",
                          )
                        ) {
                          deleteReportMutation.mutate(
                            selectedReport.id.toString(),
                          );
                        }
                      }}
                      className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-xs rounded-xl transition-all cursor-pointer group"
                      title="Delete Report"
                      disabled={deleteReportMutation.isPending}
                    >
                      <Trash2
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2.5 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-xs rounded-xl transition-all cursor-pointer group"
                    >
                      <X
                        size={18}
                        className="group-hover:rotate-90 transition-transform"
                      />
                    </button>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* 🚨 RISK LEVEL BADGE */}
                  <div
                    className={`border rounded-2xl p-4 flex items-start gap-3 shadow-sm ${risk.className}`}
                  >
                    <div
                      className={`rounded-lg p-2 shrink-0 ${risk.iconClassName}`}
                    >
                      <AlertTriangle size={18} />
                    </div>

                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wide">
                        {risk.title}
                      </h4>

                      <p className="text-sm font-medium mt-0.5">
                        {risk.message}
                      </p>
                    </div>
                  </div>

                  {/* Reporter Card */}
                  <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex items-center gap-4 hover:border-indigo-200 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden relative">
                      {selectedReport.reporter?.photo ? (
                        <img
                          src={selectedReport.reporter.photo}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={selectedReport.reporter.name}
                        />
                      ) : (
                        (selectedReport.reporter?.name?.charAt(0) ?? "?")
                      )}
                      <div className="absolute inset-0 border border-black/5 rounded-2xl"></div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        Reported By
                      </p>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {selectedReport.reporter?.name || "Unknown User"}
                      </h4>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">
                        {selectedReport.reporter?.email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex flex-col justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100/50 flex items-center justify-center mb-3 shadow-xs">
                        <AlertTriangle size={18} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                        Complaint
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-800 capitalize leading-tight">
                        {selectedReport.reason.replace("_", " ")}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex flex-col justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center mb-3 shadow-xs">
                        <Clock size={18} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                        Timestamp
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                        {formatDate(selectedReport.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Target Preview (If not CAR) */}
                  {selectedReport.targetType !== "CAR" &&
                    selectedReport.targetType !== "NEGOTIATION" &&
                    selectedReport.targetData && (
                      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400">
                          {typeConfig[selectedReport.targetType]?.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            Target ({selectedReport.targetType})
                          </p>
                          <h4 className="text-base font-black text-slate-900 truncate">
                            {selectedReport.targetData?.name ||
                              selectedReport.targetData?.title ||
                              `Target ID #${selectedReport.targetId}`}
                          </h4>
                        </div>
                      </div>
                    )}

                  {/* ── Negotiation Details Panel ── */}
                  {selectedReport.targetType === "NEGOTIATION" &&
                    selectedReport.targetData &&
                    (() => {
                      const neg = selectedReport.targetData as any;
                      const car = neg.Car || neg.car;
                      const buyer = neg.buyer;
                      const seller = neg.seller;
                      const offers: any[] = neg.Offers || [];
                      const offerStatusColor: Record<string, string> = {
                        PENDING: "bg-amber-100 text-amber-700",
                        ACCEPTED: "bg-emerald-100 text-emerald-700",
                        REJECTED: "bg-red-100 text-red-600",
                        AUTO_REJECTED: "bg-red-100 text-red-600",
                        COUNTERED: "bg-blue-100 text-blue-700",
                        EXPIRED: "bg-slate-100 text-slate-500",
                      };
                      return (
                        <div className="space-y-4">
                          {/* Vehicle */}
                          {car && (
                            <div
                              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:border-indigo-300 transition-colors"
                              onClick={() =>
                                navigate(`/cars`, {
                                  state: { openCarId: car.id },
                                })
                              }
                            >
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                🚗 Vehicle
                              </p>
                              <div className="flex items-center gap-3">
                                {car.images?.[0] && (
                                  <img
                                    src={car.images[0]}
                                    alt={car.title}
                                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-100"
                                  />
                                )}
                                <div>
                                  <p className="font-black text-slate-900 text-sm">
                                    {car.title}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {car.brand} {car.model}
                                  </p>
                                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                                    Listed: {Number(car.price).toLocaleString()}{" "}
                                    DH
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Buyer & Seller */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "👤 Buyer", user: buyer },
                              { label: "🏷️ Seller", user: seller },
                            ].map(
                              ({ label, user: u }) =>
                                u && (
                                  <div
                                    key={label}
                                    className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:border-indigo-300 transition-colors"
                                    onClick={() =>
                                      navigate(`/users`, {
                                        state: { search: u.email },
                                      })
                                    }
                                  >
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                      {label}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      {u.photo ? (
                                        <img
                                          src={u.photo}
                                          alt={u.name}
                                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold flex-shrink-0">
                                          {u.name?.[0]?.toUpperCase()}
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate">
                                          {u.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">
                                          {u.email}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ),
                            )}
                          </div>

                          {/* Negotiation Status */}
                          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Deal Status
                            </p>
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${offerStatusColor[neg.status] || "bg-slate-100 text-slate-600"}`}
                            >
                              {neg.status}
                            </span>
                          </div>

                          {/* Offer History Timeline */}
                          {offers.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                              <div className="flex items-center gap-2 mb-4">
                                <TrendingUp
                                  size={14}
                                  className="text-slate-400"
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Negotiation History
                                </p>
                              </div>
                              <div className="space-y-2">
                                {offers.map((offer: any, i: number) => (
                                  <div
                                    key={offer.id}
                                    className="flex items-center justify-between gap-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 flex-shrink-0">
                                        {i + 1}
                                      </div>
                                      <span className="text-xs text-slate-500">
                                        {offer.type === "SELLER_COUNTER"
                                          ? "Seller →"
                                          : "Buyer →"}
                                      </span>
                                      <span className="text-sm font-black text-slate-900">
                                        {Number(offer.amount).toLocaleString()}{" "}
                                        DH
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${offerStatusColor[offer.status] || "bg-slate-100 text-slate-600"}`}
                                    >
                                      {offer.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  {/* Message Pane */}
                  {selectedReport.message && (
                    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      <div className="flex items-center gap-2 mb-3 relative z-10">
                        <MessageSquare size={16} className="text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Additional Context
                        </h4>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-semibold italic border-l-[3px] border-indigo-200 pl-4 py-1 relative z-10">
                        "{selectedReport.message}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Takedown Option — only for CAR reports */}
                {selectedReport.targetType === "CAR" && (
                  <div className="px-6 sm:px-8 pb-4">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                      ${(selectedReport.targetData as any)?.isHidden
                        ? "bg-red-50 border-red-200 cursor-not-allowed opacity-80"
                        : "cursor-pointer hover:bg-red-50 border-transparent hover:border-red-100 group"}`}>
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={takedownContent}
                          onChange={(e) => setTakedownContent(e.target.checked)}
                          disabled={(selectedReport.targetData as any)?.isHidden === true}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-red-500 peer-checked:bg-red-500 transition-all flex items-center justify-center">
                          {takedownContent && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                            Hide this listing
                          </p>
                          {(selectedReport.targetData as any)?.isHidden && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Already Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(selectedReport.targetData as any)?.isHidden
                            ? "This listing is already hidden from all feeds."
                            : "The car will be removed from all feeds and active negotiations will be cancelled."}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Action Footer */}
                <div className="mt-auto px-6 sm:px-8 py-5 border-t border-slate-200/60 bg-white/90 backdrop-blur-md flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: selectedReport.id,
                        status: "ACCEPTED",
                        reporterMessage: "",
                        reportedMessage: "",
                        takedownContent,
                      });
                      handleStatusChange(selectedReport.id, "ACCEPTED");
                    }}
                    disabled={selectedReport.status === "ACCEPTED"}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] font-black text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CheckCircle2 size={20} />
                    Accept & Enforce
                  </button>
                  <button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: selectedReport.id,
                        status: "REJECTED",
                        reporterMessage: "",
                      });
                      handleStatusChange(selectedReport.id, "REJECTED");
                    }}
                    disabled={selectedReport.status === "REJECTED"}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] font-black text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <XCircle size={20} />
                    Reject & Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* 🚀 SMALL BULK ACTION MODAL */}
      {pendingBulkAction && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`px-6 py-4 border-b flex items-center gap-3 ${pendingBulkAction.status === 'ACCEPTED' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`p-2 rounded-xl ${pendingBulkAction.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {pendingBulkAction.status === 'ACCEPTED' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Bulk {pendingBulkAction.status === 'ACCEPTED' ? 'Accept' : 'Reject'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {pendingBulkAction.group.reports.length} reports selected
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Message to Reporters (Optional)</label>
                <textarea
                  value={reporterMessageInput}
                  onChange={(e) => setReporterMessageInput(e.target.value)}
                  placeholder={pendingBulkAction.status === 'ACCEPTED' ? "e.g. Thanks for reporting. Action taken." : "e.g. Report reviewed, no action needed."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 resize-none h-20"
                />
              </div>

              {pendingBulkAction.status === "ACCEPTED" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-600 uppercase">Warning to Reported User (Optional)</label>
                  <textarea
                    value={reportedMessageInput}
                    onChange={(e) => setReportedMessageInput(e.target.value)}
                    placeholder="e.g. Please follow guidelines. Your listing was removed."
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 resize-none h-20"
                  />
                </div>
              )}

              {pendingBulkAction.status === "ACCEPTED" && pendingBulkAction.group.targetType === "CAR" && (
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={takedownContent}
                    onChange={(e) => setTakedownContent(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Hide Content (Takedown)</p>
                    <p className="text-xs text-slate-400">Cancel active negotiations and hide car.</p>
                  </div>
                </label>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 flex gap-3 justify-end border-t border-slate-100">
              <button
                onClick={() => setPendingBulkAction(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkAction}
                disabled={bulkUpdateMutation.isPending}
                className={`px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-md active:translate-y-0.5 ${
                  pendingBulkAction.status === 'ACCEPTED' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' 
                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                }`}
              >
                {bulkUpdateMutation.isPending ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Reports;
