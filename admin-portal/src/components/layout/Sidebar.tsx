import { LayoutDashboard, Car, Users, MessageSquare, Settings, LogOut, ChevronRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Car, label: 'Cars Management', path: '/cars' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: ShieldCheck, label: 'Verifications', path: '/verifications' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: HelpCircle, label: 'FAQ', path: '/faq' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
    isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
    const location = useLocation();

    const handleLogout = () => {
        adminService.logout();
    };

    return (
        <aside className={`bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out h-screen shrink-0 z-30 ${isOpen ? 'w-64' : 'w-20'
            }`}>
            <div className="p-5 flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <Car size={24} className="text-white" />
                </div>
                {isOpen && (
                    <span className="text-xl font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500">
                        CarMarket<span className="text-blue-500">Admin</span>
                    </span>
                )}
            </div>

            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={!isOpen ? item.label : ''}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <item.icon size={22} className="shrink-0" />
                                {isOpen && (
                                    <span className="font-bold text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            {isActive && isOpen && <ChevronRight size={14} className="ml-auto" />}

                            {!isOpen && isActive && (
                                <div className="absolute right-0 w-1 h-6 bg-blue-500 rounded-l-full"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors duration-200 ${!isOpen ? 'justify-center' : ''
                        }`}
                >
                    <LogOut size={22} className="shrink-0" />
                    {isOpen && <span className="font-bold text-sm whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};
