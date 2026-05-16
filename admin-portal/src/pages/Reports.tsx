import React, { useState } from 'react';
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
} from 'lucide-react';

// TODO: Replace this empty array with a real API call when backend is ready:
// const { data: reports } = useQuery({ queryKey: ['reports'], queryFn: adminService.getReports });
const INITIAL_REPORTS: Report[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
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

const typeConfig: Record<string, { classes: string; icon: React.ReactNode }> = {
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface Report {
    id: number;
    userId: number;
    reporterName: string;
    reporterEmail: string;
    targetType: string;
    targetId: number;
    targetLabel: string;
    reason: string;
    message?: string;
    status: string;
    createdAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Reports = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);

    // local status update (mock – wire to API later)
    const handleStatusChange = (reportId: number, newStatus: string) => {
        setReports((prev) =>
            prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
        if (selectedReport?.id === reportId) {
            setSelectedReport((r) => r ? { ...r, status: newStatus } : r);
        }
    };

    const filtered = reports.filter((r) => {
        const matchSearch =
            r.reporterName.toLowerCase().includes(search.toLowerCase()) ||
            r.targetLabel.toLowerCase().includes(search.toLowerCase()) ||
            r.reason.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchType = typeFilter === 'ALL' || r.targetType === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    const pendingCount = reports.filter((r) => r.status === 'PENDING').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Flag size={22} className="text-red-500" />
                        Reports Management
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        Review and manage reports submitted by users.
                    </p>
                </div>

                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">
                        <AlertTriangle size={16} />
                        {pendingCount} report{pendingCount > 1 ? 's' : ''} awaiting review
                    </div>
                )}
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reports', value: reports.length, color: 'bg-slate-900', text: 'text-white', sub: 'All time' },
                    { label: 'Pending', value: reports.filter(r => r.status === 'PENDING').length, color: 'bg-amber-500', text: 'text-white', sub: 'Need action' },
                    { label: 'Reviewed', value: reports.filter(r => r.status === 'REVIEWED').length, color: 'bg-emerald-500', text: 'text-white', sub: 'Resolved' },
                    { label: 'Rejected', value: reports.filter(r => r.status === 'REJECTED').length, color: 'bg-red-500', text: 'text-white', sub: 'Dismissed' },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} ${stat.text} rounded-2xl p-4 shadow-sm`}>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm font-bold opacity-90 mt-1">{stat.label}</p>
                        <p className="text-xs opacity-60 mt-0.5">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    {/* Search */}
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search reporter, target, reason..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700 placeholder:text-slate-400"
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Reporter</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Target</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Reason</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
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
                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                        {/* Reporter */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                                                    {report.reporterName.charAt(0)}
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
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                title="View details"
                                            >
                                                <Eye size={16} />
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
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Flag size={18} className="text-red-500" />
                                <h3 className="text-base font-bold text-slate-900">Report #{selectedReport.id}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">

                            {/* Reporter info */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                                    {selectedReport.reporterName.charAt(0)}
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
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => handleStatusChange(selectedReport.id, 'REVIEWED')}
                                disabled={selectedReport.status === 'REVIEWED'}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all active:scale-95"
                            >
                                <CheckCircle2 size={15} />
                                Mark Reviewed
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedReport.id, 'REJECTED')}
                                disabled={selectedReport.status === 'REJECTED'}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all active:scale-95"
                            >
                                <XCircle size={15} />
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
