import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { CarsFilterBar } from "../components/filter/CarsFilterBar";
import { CarDetailsDrawer } from "../components/cars/CarDetailsDrawer";
import type { CarsFilters } from "../types/filter/typeCarsFilter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Trash2,
  Car as CarIcon,
  DollarSign,
  Calendar,
  MapPin,
  Loader2,
  AlertTriangle,
  X,
  Gauge,
  Tag,
  User,
  Info,
  Settings2,
  Fuel,
  Activity,
  CheckCircle2,
} from "lucide-react";

const Cars = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CarsFilters>({
    status: "ALL",
    brand: "ALL",
    city: "ALL",
    condition: "ALL",
  });
  const [carToDelete, setCarToDelete] = useState<any>(null);
  const [selectedCarDetails, setSelectedCarDetails] = useState<any>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const {
    data: cars,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cars"],
    queryFn: adminService.getCars,
  });

  useEffect(() => {
    if (location.state?.openCarId && cars) {
      const targetCar = cars.find(
        (c: any) => c.id === location.state.openCarId,
      );
      if (targetCar) {
        setSelectedCarDetails(targetCar);
      }
    }
  }, [location.state, cars]);
  console.log("data car", cars);

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      setCarToDelete(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: adminService.updateCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });

  const handleToggleVisibility = (id: number, isHidden: boolean) => {
    updateMutation.mutate({ id, isHidden });
  };

  const handleDelete = () => {
    if (carToDelete) {
      deleteMutation.mutate(carToDelete.id);
    }
  };

  const uniqueBrands = useMemo(() => {
    return [
      ...new Set((cars || []).map((c: any) => c.brand).filter(Boolean)),
    ].sort() as string[];
  }, [cars]);

  const uniqueCities = useMemo(() => {
    return [
      ...new Set((cars || []).map((c: any) => c.city).filter(Boolean)),
    ].sort() as string[];
  }, [cars]);

  const filteredCars = useMemo(() => {
    return [...(cars || [])].reverse().filter((car: any) => {
      const matchSearch =
        car.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filters.status === "ALL" ||
        car.status?.toUpperCase() === filters.status;
      const matchBrand = filters.brand === "ALL" || car.brand === filters.brand;
      const matchCity = filters.city === "ALL" || car.city === filters.city;
      const matchCondition =
        filters.condition === "ALL" || car.condition === filters.condition;

      return (
        matchSearch && matchStatus && matchBrand && matchCity && matchCondition
      );
    });
  }, [cars, searchTerm, filters]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
        <p className="font-bold">
          Error loading cars. Please check if the backend is running.
        </p>
      </div>
    );
  }

  const isVideo = (url: string) => {
    if (!url) return false;
    return /\.(mp4|mov|webm|mkv)$/i.test(url) || url.includes("/video/upload/");
  };

  const getPosterUrl = (url: string) => {
    if (!url) return undefined;
    if (url.includes("/video/upload/")) {
      // Cloudinary automatically generates a jpg thumbnail for videos
      return url.replace(/\.(mp4|mov|webm|mkv)$/i, ".jpg");
    }
    return undefined;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cars Management</h1>
          <p className="text-sm text-slate-500 font-medium">
            Review, approve, and manage car listings on the platform.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
          <Plus size={18} />
          Add New Listing
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 relative z-20">
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand, model or title..."
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <CarsFilterBar
            filters={filters}
            onChange={setFilters}
            uniqueBrands={uniqueBrands}
            uniqueCities={uniqueCities}
            totalCount={cars?.length || 0}
            filteredCount={filteredCars.length}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Car Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Year & Specs
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Price
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCars.map((car: any) => (
                <tr
                  key={car.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {car.images && car.images.length > 0 ? (
                          isVideo(car.images[0]) ? (
                            <video
                              src={car.images[0]}
                              poster={getPosterUrl(car.images[0])}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              loop
                              autoPlay
                            />
                          ) : (
                            <img
                              src={car.images[0]}
                              alt={car.title}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <CarIcon
                            size={24}
                            className="text-slate-400 opacity-50"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">
                          {car.title}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {car.brand} • {car.model}
                        </p>
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
                        {car.location || "Casablanca, MA"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                      <DollarSign size={14} className="text-slate-400" />
                      {car.price?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        car.status === "available"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : car.status === "sold"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          car.status === "available"
                            ? "bg-emerald-500"
                            : car.status === "sold"
                              ? "bg-red-500"
                              : "bg-amber-500"
                        }`}
                      ></span>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setCarToDelete(car)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                        disabled={deleteMutation.isPending}
                        title="Delete Listing"
                      >
                        {deleteMutation.isPending &&
                        carToDelete?.id === car.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedCarDetails(car);
                          setActiveMediaIndex(0);
                        }}
                        title="View Details"
                      >
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
          <p className="text-xs text-slate-500 font-bold tracking-tight">
            Showing {filteredCars.length} of {cars?.length || 0} listings
          </p>
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      {carToDelete &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Delete Car
                  </h3>
                  <p className="text-sm text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-700">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-900">
                    {carToDelete.title}
                  </strong>
                  ?
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {carToDelete.brand} • {carToDelete.model} • $
                  {carToDelete.price?.toLocaleString()}
                </p>
              </div>

              {deleteMutation.isError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600">
                    Failed to delete car. Please try again.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCarToDelete(null)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Car"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
        
      {typeof document !== "undefined" && createPortal(
        <CarDetailsDrawer
          car={selectedCarDetails}
          onClose={() => setSelectedCarDetails(null)}
          onToggleVisibility={handleToggleVisibility}
          onDelete={(car) => {
            setSelectedCarDetails(null);
            setCarToDelete(car);
          }}
        />,
        document.body
      )}
    </div>
  );
};

export default Cars;


