import React from 'react';
import { LayoutDashboard, Car, Users, MessageSquare, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Car, label: 'Cars Management', path: '/cars' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Car size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">CarMarket<span className="text-blue-500">Admin</span></span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight size={14} />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors duration-200">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};
