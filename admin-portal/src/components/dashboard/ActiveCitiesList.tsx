import { TrendingUp, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ActiveCitiesListProps {
    analytics: any;
    analyticsLoading: boolean;
}

export const ActiveCitiesList = ({ analytics, analyticsLoading }: ActiveCitiesListProps) => {
    // Transform backend data
    const chartData = (analytics?.mostActiveCities || []).slice(0, 7).map((d: any) => ({
        city: d.city || "Unknown",
        listings: parseInt(d.count),
    }));

    // Calculate total for footer
    const totalListings = chartData.reduce((acc: number, curr: any) => acc + curr.listings, 0);

    return (
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            {/* Card Header */}
            <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight text-slate-900">
                    Most Active Cities
                </h3>
                <p className="text-sm text-slate-500">
                    By active car listings · Top 7
                </p>
            </div>

            {/* Card Content */}
            <div className="p-6 pt-0 flex-1">
                {analyticsLoading ? (
                    <div className="h-[250px] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-sm font-medium text-slate-400">
                        No city data available
                    </div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ right: 30, left: 0, top: 0, bottom: 0 }}
                            >
                                <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                                <YAxis
                                    dataKey="city"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    hide
                                />
                                <XAxis dataKey="listings" type="number" hide />
                                
                                {/* Mimicking Shadcn's ChartTooltip */}
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-[2px] bg-blue-500"></div>
                                                        <span className="font-medium text-slate-900">
                                                            {payload[0].payload.city}
                                                        </span>
                                                        <span className="text-slate-500 ml-2">
                                                            {payload[0].value} listings
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                
                                <Bar 
                                    dataKey="listings" 
                                    fill="#3b82f6" 
                                    radius={4} 
                                    barSize={32}
                                >
                                    <LabelList
                                        dataKey="city"
                                        position="insideLeft"
                                        offset={12}
                                        className="fill-white font-medium"
                                        fontSize={12}
                                    />
                                    <LabelList
                                        dataKey="listings"
                                        position="right"
                                        offset={12}
                                        className="fill-slate-700 font-bold"
                                        fontSize={12}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center p-6 pt-0">
                <div className="flex flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium text-slate-900">
                        Top cities driving marketplace growth <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="leading-none text-slate-500">
                        Showing {totalListings.toLocaleString()} active cars across these regions
                    </div>
                </div>
            </div>
        </div>
    );
};

