import { TrendingUp, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserGrowthChartProps {
    analytics: any;
    analyticsLoading: boolean;
}

export const UserGrowthChart = ({ analytics, analyticsLoading }: UserGrowthChartProps) => {
    return (
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-slate-100/60 flex items-center justify-between bg-white/50">
                <div>
                    <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <TrendingUp size={18} />
                        </div>
                        User Growth
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">New registrations · Last 12 months</p>
                </div>
                {!analyticsLoading && analytics?.newUsersPerMonth && (
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-2xl font-extrabold text-slate-900">
                                {analytics.newUsersPerMonth.reduce((sum: number, d: any) => sum + parseInt(d.count), 0).toLocaleString()}
                            </p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total this period</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-6 h-[300px]">
                {analyticsLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={(analytics?.newUsersPerMonth || []).map((d: any) => ({
                                month: new Date(d.month).toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                                users: parseInt(d.count),
                            }))}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.15)', fontSize: '13px', fontWeight: 'bold', padding: '12px 16px' }}
                                formatter={(val) => [`${val ?? 0} new users`, '']}
                                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                            />
                            <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#userGrowthGradient)" dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
