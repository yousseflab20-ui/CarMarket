import { LayoutDashboard, Car, Users, MessageSquare, Settings, LogOut, ChevronRight, ShieldCheck, HelpCircle, Flag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Car, label: 'Cars Management', path: '/cars' },
    { icon: Users, label: 'User Management', path: '/users' },
    { icon: ShieldCheck, label: 'Verifications', path: '/verifications' },
    { icon: Flag, label: 'Reports', path: '/reports' },
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
        <aside className={`bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 text-white flex flex-col border-r border-white/5 shadow-2xl transition-all duration-300 ease-in-out h-screen shrink-0 z-30 ${isOpen ? 'w-64' : 'w-20'
            }`}>
            <div className="p-5 flex items-center gap-3 overflow-hidden relative border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/20 z-10">
                    <Car size={22} className="text-white" />
                </div>
                {isOpen && (
                    <span className="text-xl font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500 z-10">
                        Car<span className="text-blue-400">Market</span>
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
                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-50"></div>
                            )}
                            <div className="flex items-center gap-3 w-full z-10">
                                <item.icon size={20} className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {isOpen && (
                                    <span className="font-medium text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            {isActive && isOpen && <ChevronRight size={14} className="ml-auto text-blue-400 z-10" />}

                            {!isOpen && isActive && (
                                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)] z-20"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group ${!isOpen ? 'justify-center' : ''
                        }`}
                >
                    <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    {isOpen && <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};
