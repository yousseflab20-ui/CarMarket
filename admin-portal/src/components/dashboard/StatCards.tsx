import { TrendingUp, Users as UsersIcon, Car as CarIcon, MessageSquare, DollarSign } from 'lucide-react';

interface StatCardsProps {
    stats: any;
}

export const StatCards = ({ stats }: StatCardsProps) => {
    const statCards = [
        { label: 'Total Cars', value: stats?.totalCars || 0, change: stats?.carsChange || '0%', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30', icon: CarIcon },
        { label: 'Active Users', value: stats?.totalUsers || 0, change: stats?.usersChange || '0%', color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30', icon: UsersIcon },
        { label: 'Messages', value: stats?.totalMessages || 0, change: stats?.messagesChange || '0%', color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30', icon: MessageSquare },
        { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, change: stats?.revenueChange || '0%', color: 'from-indigo-500 to-purple-500', shadow: 'shadow-indigo-500/30', icon: DollarSign },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
                <div key={stat.label} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
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
    );
};
