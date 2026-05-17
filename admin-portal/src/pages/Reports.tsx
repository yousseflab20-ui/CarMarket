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
            (r.reporter?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.targetData?.title || r.targetData?.name || `ID #${r.targetId}`).toLowerCase().includes(search.toLowerCase()) ||
            (r.reason || '').toLowerCase().includes(search.toLowerCase());
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
                                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white text-xs font-bold overflow-hidden">
                                                    {report.reporter?.photo ? (
                                                        <img src={report.reporter.photo} alt={report.reporter.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        report.reporter?.name?.charAt(0) ?? '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{report.reporter?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-slate-400">{report.reporter?.email || 'No email'}</p>
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
                                            <p className="text-sm font-semibold text-slate-700 max-w-[160px] truncate">{report.targetData?.title || report.targetData?.name || `ID #${report.targetId}`}</p>
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

            {/* ── Detail Modal (Creative Redesign) ── */}
            {selectedReport && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className={`bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-white/50 w-[98%] max-h-[92vh] overflow-hidden flex flex-col ${selectedReport.targetType === 'CAR' && selectedReport.targetData ? 'md:flex-row max-w-5xl' : 'max-w-2xl'} animate-in zoom-in-95 duration-300`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ── Left Pane: Target Profile (Only for Cars) ── */}
                        {selectedReport.targetType === 'CAR' && selectedReport.targetData && (
                            <div className="w-full md:w-[45%] bg-slate-900 text-white relative overflow-hidden flex flex-col shrink-0 min-h-[300px] md:min-h-0">
                                {/* Blurred Background */}
                                <div className="absolute inset-0 z-0">
                                    <img src={selectedReport.targetData.images?.[0] || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f'} className="w-full h-full object-cover opacity-30 blur-2xl scale-125" alt="bg blur" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
                                </div>
                                
                                {/* Badge Bar */}
                                <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
                                    <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">Target Listing</span>
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center backdrop-blur-md border border-red-500/20">
                                        <AlertTriangle size={18} />
                                    </div>
                                </div>

                                {/* Main Car Profile */}
                                <div className="relative z-10 mt-auto p-6 sm:p-8 space-y-5">
                                    <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative group">
                                        <img src={selectedReport.targetData.images?.[0] || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={selectedReport.targetData.title} />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <p className="text-sm font-bold text-white line-clamp-2">{selectedReport.targetData.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">{selectedReport.targetData.title}</h3>
                                            <span className="bg-gradient-to-br from-blue-500 to-indigo-600 px-3.5 py-1.5 rounded-xl text-lg sm:text-xl font-black shadow-lg shadow-blue-500/30 flex-shrink-0">${selectedReport.targetData.pricePerDay}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-300 mt-1 opacity-80">{selectedReport.targetData.brand} • {selectedReport.targetData.model} • {selectedReport.targetData.year}</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                                        {[
                                            selectedReport.targetData.transmission, 
                                            selectedReport.targetData.fuelType, 
                                            selectedReport.targetData.city, 
                                            `${selectedReport.targetData.seats} Seats`
                                        ].filter(Boolean).map(badge => (
                                            <span key={badge} className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200">{badge}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Right Pane: Report Context ── */}
                        <div className={`flex flex-col bg-slate-50/50 flex-1 overflow-y-auto ${selectedReport.targetType !== 'CAR' || !selectedReport.targetData ? 'w-full' : ''}`}>
                            {/* Header */}
                            <div className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                                        <Flag className="text-red-500" size={20} />
                                        Report Protocol
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider hidden sm:block">SYS-ID #{selectedReport.id}</p>
                                </div>
                                <button onClick={() => setSelectedReport(null)} className="p-2.5 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-xs rounded-xl transition-all cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            {/* Content Grid */}
                            <div className="p-6 sm:p-8 space-y-6">
                                {/* Reporter Card */}
                                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex items-center gap-4 hover:border-indigo-200 transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden relative">
                                        {selectedReport.reporter?.photo ? (
                                            <img src={selectedReport.reporter.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={selectedReport.reporter.name} />
                                        ) : (
                                            selectedReport.reporter?.name?.charAt(0) ?? '?'
                                        )}
                                        <div className="absolute inset-0 border border-black/5 rounded-2xl"></div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Reported By</p>
                                        <h4 className="text-base sm:text-lg font-black text-slate-900">{selectedReport.reporter?.name || 'Unknown User'}</h4>
                                        <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{selectedReport.reporter?.email || 'No email provided'}</p>
                                    </div>
                                </div>
                                
                                {/* Info Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex flex-col justify-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100/50 flex items-center justify-center mb-3 shadow-xs">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Complaint</p>
                                        <p className="text-sm sm:text-base font-bold text-slate-800 capitalize leading-tight">{selectedReport.reason.replace('_', ' ')}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex flex-col justify-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center mb-3 shadow-xs">
                                            <Clock size={18} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Timestamp</p>
                                        <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight">{formatDate(selectedReport.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Target Preview (If not structured car) */}
                                {(selectedReport.targetType !== 'CAR' || !selectedReport.targetData) && (
                                     <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400">
                                            {typeConfig[selectedReport.targetType].icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Target Protocol ({selectedReport.targetType})</p>
                                            <h4 className="text-base font-black text-slate-900 truncate">{selectedReport.targetData?.name || selectedReport.targetData?.title || `Target ID #${selectedReport.targetId}`}</h4>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Message Pane */}
                                {selectedReport.message && (
                                    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                        <div className="flex items-center gap-2 mb-3 relative z-10">
                                            <MessageSquare size={16} className="text-slate-400" />
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Additional Context</h4>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-semibold italic border-l-[3px] border-indigo-200 pl-4 py-1 relative z-10">
                                            "{selectedReport.message}"
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Action Footer */}
                            <div className="mt-auto px-6 sm:px-8 py-5 border-t border-slate-200/60 bg-white/90 backdrop-blur-md flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => updateStatusMutation.mutate({ id: selectedReport.id, status: 'REVIEWED' })}
                                    disabled={selectedReport.status === 'REVIEWED'}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] font-black text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <CheckCircle2 size={20} />
                                    Mark as Reviewed
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedReport.id, "REJECTED")}
                                    disabled={selectedReport.status === 'REJECTED'}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] font-black text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <XCircle size={20} />
                                    Reject & Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
