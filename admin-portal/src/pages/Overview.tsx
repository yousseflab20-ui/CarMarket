import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Loader2, TrendingUp, Users as UsersIcon, Car as CarIcon, MessageSquare, DollarSign, Activity, CheckCircle2, BarChart3, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Overview = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminService.getStats,
    });

    const generateReport = () => {
        const reportData = {
            overview: stats?.overview || {},
            performance: stats?.performance || [],
            systemPerformance: stats?.systemPerformance || [],
            generatedAt: new Date().toISOString(),
            reportType: 'Admin Dashboard Report'
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Cars', value: stats?.totalCars || 0, change: stats?.carsChange || '0%', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30', icon: CarIcon },
        { label: 'Active Users', value: stats?.totalUsers || 0, change: stats?.usersChange || '0%', color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30', icon: UsersIcon },
        { label: 'Messages', value: stats?.totalMessages || 0, change: stats?.messagesChange || '0%', color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', icon: MessageSquare },
        { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, change: stats?.revenueChange || '0%', color: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/30', icon: DollarSign },
    ];

    const chartData = stats?.chartData || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                            <BarChart3 size={24} strokeWidth={2.5} />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            Dashboard Overview
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-2">
                        Welcome back to the CarMarket management hub. 
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </p>
                </div>
                <button 
                    onClick={generateReport}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_10px_25px_rgba(59,130,246,0.4)] transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center gap-2 cursor-pointer group"
                >
                    <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                    Download Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg ${stat.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                <stat.icon size={26} className="text-white" />
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                                <TrendingUp size={14} />
                                {stat.change}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-4xl font-extrabold text-slate-900 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">{stat.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100/60 flex items-center justify-between bg-white/50">
                        <div>
                            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <Activity size={18} />
                                </div>
                                Platform Growth
                            </h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Monthly user & listing acquisition</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Cars</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-6 min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="listings" stroke="#6366f1" strokeWidth={3} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100/60 flex items-center justify-between bg-white/50">
                        <h3 className="font-extrabold text-slate-900 text-lg">System Performance</h3>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                        {(stats?.systemPerformance || []).map((svc: any) => (
                            <div key={svc.name} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">{svc.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400">{svc.load}</span>
                                        <span className={`w-2 h-2 rounded-full ${svc.color} animate-pulse`}></span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${svc.color} transition-all duration-1000`} style={{ width: svc.status === 'Operational' ? '100%' : '60%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">All systems healthy</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
