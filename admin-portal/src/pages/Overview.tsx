import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Loader2, TrendingUp, Users as UsersIcon, Car as CarIcon, MessageSquare, DollarSign, Activity, CheckCircle2, BarChart3, Download, FileText } from 'lucide-react';
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
        { label: 'Total Cars', value: stats?.totalCars || 0, change: stats?.carsChange || '0%', color: 'bg-blue-500', icon: CarIcon },
        { label: 'Active Users', value: stats?.totalUsers || 0, change: stats?.usersChange || '0%', color: 'bg-emerald-500', icon: UsersIcon },
        { label: 'Messages', value: stats?.totalMessages || 0, change: stats?.messagesChange || '0%', color: 'bg-amber-500', icon: MessageSquare },
        { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, change: stats?.revenueChange || '0%', color: 'bg-indigo-500', icon: DollarSign },
    ];

    const chartData = stats?.chartData || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center">
                            <BarChart3 className="text-blue-600" size={22} strokeWidth={2} />
                        </div>
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Welcome back to the CarMarket management hub.</p>
                </div>
                <button 
                    onClick={generateReport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <Download size={16} />
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color}/10 rounded-xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                <TrendingUp size={12} />
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" />
                                Platform Growth
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Monthly user & listing acquisition</p>
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

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">System Performance</h3>
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
