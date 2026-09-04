import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Loader2, BarChart3, Download } from 'lucide-react';
import { useAnalytics } from '../services/analytics/queries.analytics';

// Components
import { StatCards } from '../components/dashboard/StatCards';
import { SystemPerformance } from '../components/dashboard/SystemPerformance';
import { UserGrowthChart } from '../components/dashboard/UserGrowthChart';
import { ActiveCitiesList } from '../components/dashboard/ActiveCitiesList';

const Overview = () => {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminService.getStats,
    });

    const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

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
        a.download = "admin-report-" + new Date().toISOString().split('T')[0] + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (statsLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* -- Header ---------------------------------------------- */}
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

            {/* -- Top Stat Cards --------------------------------------- */}
            <StatCards stats={stats} />

            {/* -- Analytics & System Performance ----------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <UserGrowthChart analytics={analytics} analyticsLoading={analyticsLoading} />
                <ActiveCitiesList analytics={analytics} analyticsLoading={analyticsLoading} />
                <SystemPerformance performanceData={stats?.systemPerformance || []} />
            </div>
        </div>
    );
};

export default Overview;
