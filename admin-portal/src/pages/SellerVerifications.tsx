import { useState } from 'react';
import { Search, ShieldCheck, Check, X, Eye, FileText, ChevronDown, MapPin, Phone, Calendar, Mail, Camera, Quote, Filter } from 'lucide-react';
import { adminService } from "../services/adminService"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'approved':
            return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"><Check size={14} /> Approved</span>;
        case 'rejected':
            return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shadow-sm"><X size={14} /> Rejected</span>;
        default:
            return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"><Calendar size={14} /> Pending</span>;
    }
};

const SellerVerifications = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    const { data: verifications = [] as any[], isLoading } = useQuery({
        queryKey: ["verifications", filterStatus],
        queryFn: () => adminService.getPendingVerifications(filterStatus)
    });
    console.log("log status verification", verifications)
    const approveMutation = useMutation({
        mutationFn: adminService.approveVerification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["verifications"] });
            setSelectedRequest(null);
        }
    });

    const rejectMutation = useMutation({
        mutationFn: adminService.rejectVerification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["verifications"] });
            setSelectedRequest(null);
        }
    });

    const filteredRequests = verifications.filter((req: any) => {
        const matchesSearch = req.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleAction = (id: string | number, action: 'approve' | 'reject') => {
        if (action === 'approve') {
            approveMutation.mutate(id);
        } else {
            rejectMutation.mutate(id);
        }
    };

    const pendingCount = verifications.filter((r: any) => r.verificationStatus === 'pending').length;
    const totalCount = verifications.length;

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 font-bold">Loading verifications...</div>;
    }
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-3">
                        <ShieldCheck size={14} />
                        Seller Moderation
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Identity Verifications
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Review, approve or reject users requesting to become authorized sellers on CarMarket.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-1 text-center border-r border-slate-100">
                        <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pending</div>
                    </div>
                    <div className="px-4 py-1 text-center">
                        <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total</div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-2 md:p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider ml-2">
                        <Filter size={14} />
                        Filter:
                    </div>
                    <div className="relative min-w-[180px]">
                        <select
                            className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer shadow-sm border border-slate-100"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Verifications</option>
                            <option value="pending">Pending Only</option>
                            <option value="approved">Approved Sellers</option>
                            <option value="rejected">Rejected Requests</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4 rounded-tl-2xl">Seller</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Request Date</th>
                                <th className="px-6 py-4">Document</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.map((request: any) => (
                                <tr
                                    key={request.id}
                                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedRequest(request)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={request.photo ? (typeof request.photo === 'string' ? request.photo : request.photo.uri) : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                                                    alt={request.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                                {request.verificationStatus === 'approved' && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                                                        <Check size={8} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{request.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <MapPin size={12} /> {request.city || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-slate-600 font-medium space-y-1">
                                            <div className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {request.email}</div>
                                            <div className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {request.phone || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700 font-semibold">
                                            {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {new Date(request.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                                            <FileText size={16} className="text-blue-500" />
                                            {request.Verificationphoto ? "Selfie Provided" : "No Document"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(request.verificationStatus)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRequest(request);
                                                }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent shadow-sm hover:border-blue-200 hover:shadow cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <div className="h-6 w-px bg-slate-200 mx-1"></div>

                                            {request.verificationStatus !== 'approved' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction(request.id, 'approve');
                                                    }}
                                                    className="p-2 text-emerald-500 hover:text-white hover:bg-emerald-500 rounded-lg transition-all border border-emerald-100 shadow-sm hover:shadow-emerald-500/20 cursor-pointer"
                                                    title="Approve Request"
                                                    disabled={approveMutation.isPending}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}

                                            {request.verificationStatus !== 'rejected' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction(request.id, 'reject');
                                                    }}
                                                    className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-red-100 shadow-sm hover:shadow-red-500/20 cursor-pointer"
                                                    title="Reject Request"
                                                    disabled={rejectMutation.isPending}
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                                            <ShieldCheck size={32} className="text-slate-300" />
                                        </div>
                                        <p className="text-base font-bold text-slate-700">No verifications found</p>
                                        <p className="text-sm mt-1 text-slate-400">Try adjusting your search or filter criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelectedRequest(null)}
                    ></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">Verification Details</h2>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-5">
                                        <img
                                            src={selectedRequest.photo ? (typeof selectedRequest.photo === 'string' ? selectedRequest.photo : selectedRequest.photo.uri) : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                                            alt={selectedRequest.name}
                                            className="w-20 h-20 rounded-full object-cover shadow-md border-4 border-white"
                                        />
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-slate-900">{selectedRequest.name}</h3>
                                            <div className="mt-2">{getStatusBadge(selectedRequest.verificationStatus)}</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Contact Information</h4>
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-blue-500"><Mail size={16} /></div>
                                            <span className="font-medium text-sm">{selectedRequest.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-blue-500"><Phone size={16} /></div>
                                            <span className="font-medium text-sm">{selectedRequest.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-blue-500"><MapPin size={16} /></div>
                                            <span className="font-medium text-sm">{selectedRequest.city || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-blue-500"><Calendar size={16} /></div>
                                            <div className="text-sm">
                                                <span className="font-medium">Requested on: </span>
                                                <span className="text-slate-500">{new Date(selectedRequest.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        {selectedRequest.bio && (
                                            <div className="mt-8 relative pt-4">
                                                <div className="absolute top-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
                                                <div className="flex gap-4">
                                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                                                        <Quote size={20} fill="currentColor" className="opacity-20" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Seller Statement</h4>
                                                        <p className="text-sm text-slate-700 leading-relaxed font-medium italic bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                                            "{selectedRequest.bio}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:w-64 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Provided Selfie</h4>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 border border-blue-100 w-full mb-2">
                                        <Camera size={16} />
                                        Identity Verification
                                    </div>
                                    <div className="aspect-[3/4] rounded-xl border-2 border-slate-100 bg-slate-50 overflow-hidden relative group">
                                        {selectedRequest.Verificationphoto ? (
                                            <img
                                                src={selectedRequest.Verificationphoto}
                                                alt="Document"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                                                <X size={48} strokeWidth={1} />
                                                <span className="text-xs font-bold mt-2">No Photo Provided</span>
                                            </div>
                                        )}
                                        {selectedRequest.Verificationphoto && (
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                                                <a
                                                    href={selectedRequest.Verificationphoto}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all transform translate-y-2 group-hover:translate-y-0"
                                                >
                                                    <Eye size={16} /> View Full
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-end items-center">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                            >
                                Close
                            </button>

                            {selectedRequest.verificationStatus !== 'rejected' && (
                                <button
                                    onClick={() => handleAction(selectedRequest.id, 'reject')}
                                    disabled={rejectMutation.isPending}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <X size={18} /> {rejectMutation.isPending ? "Rejecting..." : "Reject Application"}
                                </button>
                            )}

                            {selectedRequest.verificationStatus !== 'approved' && (
                                <button
                                    onClick={() => handleAction(selectedRequest.id, 'approve')}
                                    disabled={approveMutation.isPending}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <Check size={18} /> {approveMutation.isPending ? "Approving..." : "Approve Seller"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerVerifications;
