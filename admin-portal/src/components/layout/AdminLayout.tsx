import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';

export const AdminLayout = () => {
    return (
        <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans antialiased">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-lg w-96">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users, cars, or messages..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200"></div>

                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Admin User</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                                <User size={20} className="text-slate-600 group-hover:text-blue-600" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
