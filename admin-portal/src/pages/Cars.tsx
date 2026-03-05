import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Trash2, Car as CarIcon, DollarSign, Calendar, MapPin } from 'lucide-react';

// Mock data for initial UI implementation
const MOCK_CARS = [
    { id: 1, title: 'Luxury BMW 5 Series', brand: 'BMW', model: '5 Series', year: 2023, price: 45000, status: 'Available', image: null },
    { id: 2, title: 'Sporty Audi RS6', brand: 'Audi', model: 'RS6', year: 2022, price: 85000, status: 'Sold', image: null },
    { id: 3, title: 'Electric Tesla Model 3', brand: 'Tesla', model: 'Model 3', year: 2024, price: 38000, status: 'Available', image: null },
    { id: 4, title: 'Classic Mercedes E-Class', brand: 'Mercedes', model: 'E-Class', year: 2021, price: 32000, status: 'Pending', image: null },
];

const Cars = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cars Management</h1>
                    <p className="text-sm text-slate-500 font-medium">Review, approve, and manage car listings on the platform.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                    <Plus size={18} />
                    Add New Listing
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by brand, model or title..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Filter size={14} />
                            Filters
                        </button>
                        <select className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 transition-colors">
                            <option>All Status</option>
                            <option>Available</option>
                            <option>Sold</option>
                            <option>Pending</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Car Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Year & Specs</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_CARS.map((car) => (
                                <tr key={car.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {car.image ? (
                                                    <img src={car.image} alt={car.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <CarIcon size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">{car.title}</p>
                                                <p className="text-xs text-slate-500 font-medium">{car.brand} • {car.model}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                                                <Calendar size={12} className="text-slate-400" />
                                                {car.year}
                                            </p>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                                <MapPin size={11} className="text-slate-400" />
                                                Casablanca, MA
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                                            <DollarSign size={14} className="text-slate-400" />
                                            {car.price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${car.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                                                car.status === 'Sold' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'Available' ? 'bg-emerald-500' :
                                                    car.status === 'Sold' ? 'bg-slate-400' : 'bg-amber-500'
                                                }`}></span>
                                            {car.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Listing">
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-xs text-slate-500 font-medium">Showing 4 of 124 listings</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cars;
