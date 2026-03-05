import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useState } from 'react';

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans antialiased">
            <Sidebar isOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl w-full max-w-md focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all border border-transparent focus-within:border-blue-200">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Admin User</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center border border-blue-400/20 shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-all">
                                <User size={20} className="text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
