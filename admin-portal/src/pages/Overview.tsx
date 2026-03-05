

const Overview = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500 font-medium">Welcome back to the CarMarket management hub.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95">
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Cars', value: '124', change: '+12%', color: 'bg-blue-500' },
                    { label: 'Active Users', value: '1,042', change: '+5%', color: 'bg-emerald-500' },
                    { label: 'Unread Messages', value: '18', change: '-2%', color: 'bg-amber-500' },
                    { label: 'Total Revenue', value: '$42,500', change: '+18%', color: 'bg-indigo-500' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 ${stat.color} rounded-xl opacity-10 flex border border-slate-200`}></div>
                            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{stat.change}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Recent Activity</h3>
                    <button className="text-sm text-blue-600 font-bold hover:underline">View All</button>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                    <p className="text-sm italic">Charts and detailed tables will be implemented here...</p>
                </div>
            </div>
        </div>
    );
};

export default Overview;
