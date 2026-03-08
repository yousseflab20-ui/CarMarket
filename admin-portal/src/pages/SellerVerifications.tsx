import { useState } from 'react';
import { Search, Filter, ShieldCheck, Check, X, Eye, FileText, ChevronDown } from 'lucide-react';

const mockVerifications = [
    {
        id: '1',
        name: 'Ahmed Yassine',
        email: 'ahmed.yassine@example.com',
        requestDate: '2026-03-08T10:30:00Z',
        documentType: 'National ID',
        status: 'pending',
        avatar: 'https://i.pravatar.cc/150?u=ahmed',
    },
    {
        id: '2',
        name: 'Fatima Zahra',
        email: 'fatima.zahra@example.com',
        requestDate: '2026-03-07T14:15:00Z',
        documentType: 'Passport',
        status: 'approved',
        avatar: 'https://i.pravatar.cc/150?u=fatima',
    },
    {
        id: '3',
        name: 'Karim Benali',
        email: 'karim.benali@example.com',
        requestDate: '2026-03-06T09:45:00Z',
        documentType: 'Business License',
        status: 'rejected',
        avatar: 'https://i.pravatar.cc/150?u=karim',
    },
    {
        id: '4',
        name: 'Sara Mounir',
        email: 'sara.mounir@example.com',
        requestDate: '2026-03-08T08:20:00Z',
        documentType: 'National ID',
        status: 'pending',
        avatar: 'https://i.pravatar.cc/150?u=sara',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
};

const SellerVerifications = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredRequests = mockVerifications.filter(req => {
        const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <ShieldCheck size={24} />
                        </div>
                        Seller Verifications
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Review and manage user requests to become verified sellers.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <button className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Request Date</th>
                                <th className="px-6 py-4">Document Provided</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={request.avatar} alt={request.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{request.name}</div>
                                                <div className="text-xs text-slate-500">{request.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700 font-medium">
                                            {new Date(request.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(request.requestDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                                            <FileText size={14} className="text-slate-500" />
                                            {request.documentType}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Documents">
                                                <Eye size={18} />
                                            </button>
                                            {request.status === 'pending' && (
                                                <>
                                                    <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Approve Request">
                                                        <Check size={18} />
                                                    </button>
                                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Reject Request">
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <ShieldCheck size={48} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-sm font-bold text-slate-700">No verifications found</p>
                                        <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerVerifications;
