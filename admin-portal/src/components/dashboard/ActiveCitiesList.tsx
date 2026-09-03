import { BarChart3, Loader2 } from 'lucide-react';

interface ActiveCitiesListProps {
    analytics: any;
    analyticsLoading: boolean;
}

export const ActiveCitiesList = ({ analytics, analyticsLoading }: ActiveCitiesListProps) => {
    return (
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-slate-100/60 bg-white/50">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <BarChart3 size={18} />
                    </div>
                    Most Active Cities
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">By active listings · Top 7</p>
            </div>
            <div className="p-6">
                {analyticsLoading ? (
                    <div className="h-48 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : (() => {
                    const cities = (analytics?.mostActiveCities || []).slice(0, 7);
                    const max = Math.max(...cities.map((d: any) => parseInt(d.count)), 1);
                    const colors = ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6'];
                    
                    if (cities.length === 0) {
                        return (
                            <div className="h-[250px] flex items-center justify-center text-sm font-bold text-slate-400">
                                No city data available
                            </div>
                        );
                    }

                    return (
                        <div className="space-y-4 pt-2">
                            {cities.map((d: any, i: number) => (
                                <div key={d.city} className="flex items-center gap-4 group">
                                    <span className="text-[11px] font-black text-slate-300 w-5 text-right tabular-nums">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 w-24 shrink-0 truncate">{d.city || 'Unknown'}</span>
                                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${(parseInt(d.count) / max) * 100}%`, backgroundColor: colors[i % colors.length] }}
                                        />
                                    </div>
                                    <span className="text-sm font-black tabular-nums" style={{ color: colors[i % colors.length] }}>
                                        {parseInt(d.count).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
