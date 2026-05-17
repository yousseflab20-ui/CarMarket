import { useState } from 'react';
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
} from 'lucide-react';
import type { Report, StatusConfigItem, TypeConfigItem } from '../types/Reports/ReportType';
import { getReport, updateReport } from '../services/Report/endpointReport';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/react-query';
const statusConfig: Record<string, StatusConfigItem> = {
    PENDING: {
        label: 'Pending',
        classes: 'bg-amber-50 text-amber-700 border border-amber-200',
        icon: <Clock size={11} />,
    },
    REVIEWED: {
        label: 'Reviewed',
        classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        icon: <CheckCircle2 size={11} />,
    },
    REJECTED: {
        label: 'Rejected',
        classes: 'bg-red-50 text-red-600 border border-red-200',
        icon: <XCircle size={11} />,
    },
};

const typeConfig: Record<string, TypeConfigItem> = {
    CAR: {
        classes: 'bg-blue-50 text-blue-700 border border-blue-200',
        icon: <Car size={11} />,
    },
    USER: {
        classes: 'bg-purple-50 text-purple-700 border border-purple-200',
        icon: <UserIcon size={11} />,
    },
    POST: {
        classes: 'bg-slate-50 text-slate-700 border border-slate-200',
        icon: <FileText size={11} />,
    },
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};


const Reports = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});

    const { data: reportsData, isLoading, error } = useQuery<Report[]>({
        queryKey: ['reports'],
        queryFn: getReport,
    });
    console.log("reportsData", reportsData);
    const updateStatusMutation = useMutation({
        mutationFn: updateReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        }
    });

    console.log("reportsData", reportsData);
    const reports: Report[] = (reportsData ?? []).map((r) => ({
        ...r,
        status: localStatuses[r.id] ?? r.status,
    }));

    if (isLoading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
            <p className="font-bold">Error loading reports. Please check if the backend is running.</p>
        </div>
    );

    const handleStatusChange = (reportId: number, newStatus: string) => {
        setLocalStatuses((prev) => ({ ...prev, [reportId]: newStatus }));
        if (selectedReport?.id === reportId) {
            setSelectedReport((r) => r ? { ...r, status: newStatus } : r);
        }
    };

    const filtered = reports.filter((r) => {
        const matchSearch =
            r.reporterName?.toLowerCase().includes(search.toLowerCase()) ||
            r.targetLabel?.toLowerCase().includes(search.toLowerCase()) ||
            r.reason?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchType = typeFilter === 'ALL' || r.targetType === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    const pendingCount = reports.filter((r) => r.status === 'PENDING').length;

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
                        {pendingCount} report{pendingCount > 1 ? 's' : ''} awaiting review
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reports', value: reports.length, color: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-500/30', sub: 'All time' },
                    { label: 'Pending', value: reports.filter(r => r.status === 'PENDING').length, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', sub: 'Need action' },
                    { label: 'Reviewed', value: reports.filter(r => r.status === 'REVIEWED').length, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30', sub: 'Resolved' },
                    { label: 'Rejected', value: reports.filter(r => r.status === 'REJECTED').length, color: 'from-red-500 to-rose-500', shadow: 'shadow-red-500/30', sub: 'Dismissed' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>

                        <div className="relative z-10">
                            <p className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{stat.value}</p>
                            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{stat.label}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between relative z-10 border-t border-slate-100/60 pt-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.sub}</p>
                            <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md ${stat.shadow} group-hover:rotate-3 group-hover:scale-110 transition-transform duration-300`}>
                                {stat.label === 'Total Reports' ? <FileText size={14} className="text-white" /> :
                                    stat.label === 'Pending' ? <Clock size={14} className="text-white" /> :
                                        stat.label === 'Reviewed' ? <CheckCircle2 size={14} className="text-white" /> :
                                            <XCircle size={14} className="text-white" />}
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
                        <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
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
                            <span className="text-xs font-bold text-slate-400 uppercase">Filter:</span>
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
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Reporter</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Type</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Target</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Reason</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Date</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <Flag size={32} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-sm font-bold text-slate-400">No reports found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            )}

                            {filtered.map((report) => {
                                const status = statusConfig[report.status];
                                const type = typeConfig[report.targetType];
                                return (
                                    <tr key={report.id} className="hover:bg-blue-50/40 transition-colors duration-300 group border-b border-transparent hover:border-blue-100">
                                        {/* Reporter */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                                                    {report.reporterName?.charAt(0) ?? '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{report.reporterName}</p>
                                                    <p className="text-xs text-slate-400">{report.reporterEmail}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${type.classes}`}>
                                                {type.icon}
                                                {report.targetType}
                                            </span>
                                        </td>

                                        {/* Target */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-700 max-w-[160px] truncate">{report.targetLabel}</p>
                                            <p className="text-xs text-slate-400">ID #{report.targetId}</p>
                                        </td>

                                        {/* Reason */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 max-w-[140px] truncate font-medium">{report.reason}</p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.classes}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">{formatDate(report.createdAt)}</p>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedReport(report)}
                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all duration-300 cursor-pointer"
                                                title="View details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <p className="text-xs text-slate-400 font-bold">
                        Showing {filtered.length} of {reports.length} reports
                    </p>
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {selectedReport && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white max-w-lg w-full animate-in zoom-in-95 duration-300 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100/60 bg-white/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 text-white">
                                    <Flag size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Report #{selectedReport.id}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Report Details</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">

                            {/* Reporter info */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                                    {selectedReport.reporterName?.charAt(0) ?? '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{selectedReport.reporterName}</p>
                                    <p className="text-xs text-slate-500">{selectedReport.reporterEmail}</p>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeConfig[selectedReport.targetType].classes}`}>
                                        {typeConfig[selectedReport.targetType].icon}
                                        {selectedReport.targetType}
                                    </span>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target</p>
                                    <p className="text-xs font-bold text-slate-700 truncate">{selectedReport.targetLabel}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reason</p>
                                    <p className="text-xs font-bold text-slate-700">{selectedReport.reason}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                                    <p className="text-xs font-bold text-slate-700">{formatDate(selectedReport.createdAt)}</p>
                                </div>
                            </div>

                            {/* Message */}
                            {selectedReport.message && (
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <MessageSquare size={13} className="text-slate-400" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">User Message</p>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{selectedReport.message}</p>
                                </div>
                            )}

                            {/* Current Status */}
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-500">Current status:</p>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig[selectedReport.status].classes}`}>
                                    {statusConfig[selectedReport.status].icon}
                                    {statusConfig[selectedReport.status].label}
                                </span>
                            </div>
                        </div>

                        {/* Modal Footer – Actions */}
                        <div className="px-6 py-5 border-t border-slate-100/60 bg-slate-50/50 flex gap-3">
                            <button
                                onClick={() => updateStatusMutation.mutate({ id: selectedReport.id, status: 'REVIEWED' })}
                                disabled={selectedReport.status === 'REVIEWED'}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/40 font-bold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <CheckCircle2 size={18} />
                                Mark Reviewed
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedReport.id, "REJECTED")}
                                disabled={selectedReport.status === 'REJECTED'}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-lg shadow-red-500/30 hover:shadow-red-600/40 font-bold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <XCircle size={18} />
                                Reject Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
