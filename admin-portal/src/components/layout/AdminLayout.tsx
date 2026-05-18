import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../services/api';

const socket = io(API_BASE_URL);

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        socket.on('new_user', (data: { name: string; email: string; message: string }) => {
            console.log('New user event received:', data);
            const userStr = localStorage.getItem('admin_user');
            if (userStr) {
                try {
                    const adminUser = JSON.parse(userStr);
                    if (adminUser.desktopAlerts === true && Notification.permission === 'granted') {
                        new Notification('New User Registered', {
                            body: `${data.name} (${data.email}) just signed up!`,
                            icon: '/favicon.ico'
                        });
                    }
                } catch (e) {
                    console.error('Error parsing admin user for notifications', e);
                }
            }
        });

        return () => {
            socket.off('new_user');
        };
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans antialiased selection:bg-blue-100">
            <Sidebar isOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Decorative background gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-10"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <header className="h-20 backdrop-blur-xl bg-white/70 border-b border-slate-200/60 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm sticky top-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-all duration-300 shadow-sm border border-transparent hover:border-slate-200/50 bg-white/50"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-2xl w-full max-w-md focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 border border-slate-200 focus-within:border-blue-300 group">
                            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search everywhere..."
                                className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700 placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button className="relative p-2.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300 bg-white/50 border border-slate-200/50 shadow-sm group">
                            <Bell size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-500/50 animate-pulse"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Admin User</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center border border-blue-400/30 shadow-[0_4px_15px_rgba(59,130,246,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <User size={20} className="text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-8 scroll-smooth z-10">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
