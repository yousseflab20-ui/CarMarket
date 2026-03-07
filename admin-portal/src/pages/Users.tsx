import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Search, UserPlus, MoreVertical, Trash2, Mail, Shield, User as UserIcon, Loader2, AlertTriangle } from 'lucide-react';

const Users = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState<any>(null);

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: adminService.getUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setUserToDelete(null);
        },
    });

    const handleDelete = () => {
        if (userToDelete) {
            deleteMutation.mutate(userToDelete.id);
        }
    };

    const filteredUsers = users?.filter((user: any) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-bold">Error loading users. Please check if the backend is running.</p>
            </div>
        );
    }

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
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 uppercase text-xs font-bold text-slate-400">
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
                            {filteredUsers.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
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
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setUserToDelete(user)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                disabled={deleteMutation.isPending}
                                                title="Delete User"
                                            >
                                                {deleteMutation.isPending && userToDelete?.id === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
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
                    <p className="text-xs text-slate-500 font-bold tracking-tight">Showing {filteredUsers.length} of {users?.length || 0} users</p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Delete User</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-slate-700">
                                Are you sure you want to delete <strong className="text-slate-900">{userToDelete.name}</strong>?
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{userToDelete.email}</p>
                        </div>

                        {deleteMutation.isError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                <p className="text-sm text-red-600">Failed to delete user. Please try again.</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setUserToDelete(null)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete User'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
