import { CheckCircle2 } from 'lucide-react';

interface SystemPerformanceProps {
    performanceData: any[];
}

export const SystemPerformance = ({ performanceData }: SystemPerformanceProps) => {
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100/60 flex items-center justify-between bg-white/50">
                <h3 className="font-extrabold text-slate-900 text-lg">
                    System Performance
                </h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
                {performanceData.map((svc: any) => (
                    <div key={svc.name} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">
                                {svc.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400">
                                    {svc.load}
                                </span>
                                <span
                                    className={`w-2 h-2 rounded-full ${svc.color} animate-pulse`}
                                ></span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${svc.color} transition-all duration-1000`}
                                style={{
                                    width: svc.status === 'Operational' ? '100%' : '60%',
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    All systems healthy
                </span>
            </div>
        </div>
    );
};
