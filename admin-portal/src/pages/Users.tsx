import { useState } from 'react';
import { Search, UserPlus, MoreVertical, Trash2, Mail, Shield, User as UserIcon } from 'lucide-react';

// Mock data for initial UI implementation
const MOCK_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@carmarket.com', role: 'ADMIN', status: 'Active', photo: null },
    { id: 2, name: 'Youssef Lab', email: 'youssef@example.com', role: 'USER', status: 'Active', photo: null },
    { id: 3, name: 'Amine Ben', email: 'amine@test.ma', role: 'USER', status: 'Inactive', photo: null },
    { id: 4, name: 'Sara Kamel', email: 'sara@web.com', role: 'USER', status: 'Active', photo: null },
];

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage user accounts, roles, and access permissions.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                    <UserPlus size={18} />
                    Create New User
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 uppercase text-[10px] font-bold text-slate-400">
                        <span>Filter:</span>
                        <select className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-700 outline-none">
                            <option>All Roles</option>
                            <option>Admins</option>
                            <option>Regular Users</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_USERS.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                                {user.photo ? (
                                                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600'
                                            }`}>
                                            {user.role === 'ADMIN' && <Shield size={10} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete User">
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-xs text-slate-500 font-medium">Showing 4 of 24 users</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
