import React, { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Gauge,
  Tag,
  DollarSign,
  User,
  Settings2,
  Fuel,
  Activity,
  EyeOff,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";

interface Props {
  car: any | null;
  onClose: () => void;
  onToggleVisibility?: (carId: number, isHidden: boolean) => void;
  onDelete?: (car: any) => void;
  isUpdating?: boolean;
}

export const CarDetailsDrawer = ({
  car,
  onClose,
  onToggleVisibility,
  onDelete,
  isUpdating,
}: Props) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  React.useEffect(() => {
    if (car) {
      setActiveMediaIndex(0);
      setConfirmDelete(false);
    }
  }, [car?.id]);

  if (!car) return null;

  const isVideo = (url: string) => {
    if (!url) return false;
    return /\.(mp4|mov|webm|mkv)$/i.test(url) || url.includes("/video/upload/");
  };

  const getPosterUrl = (url: string) => {
    if (!url) return undefined;
    if (url.includes("/video/upload/")) {
      return url.replace(/\.(mp4|mov|webm|mkv)$/i, ".jpg");
    }
    return undefined;
  };

  const statusColors: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sold: "bg-red-50 text-red-700 border-red-200",
    reserved: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[450px] bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              {car.images?.[0] ? (
                isVideo(car.images[0]) ? (
                  <video
                    src={car.images[0]}
                    poster={getPosterUrl(car.images[0])}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-xl">
                  {car.brand?.charAt(0) ?? "C"}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 truncate max-w-[220px]">
                {car.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    statusColors[car.status?.toLowerCase()] ?? "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {car.status}
                </span>
                {car.isHidden && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border bg-amber-50 text-amber-700 border-amber-200">
                    <EyeOff size={10} /> Hidden
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col">
          <div className="p-6 space-y-8">

            {/* Media */}
            <section className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Media</h3>
              <div className="w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                {car.images && car.images.length > 0 ? (
                  isVideo(car.images[activeMediaIndex]) ? (
                    <video
                      src={car.images[activeMediaIndex]}
                      poster={getPosterUrl(car.images[activeMediaIndex])}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      muted
                    />
                  ) : (
                    <img src={car.images[activeMediaIndex]} alt={car.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                    No media
                  </div>
                )}
                {car.isHidden && (
                  <div className="absolute top-3 left-3 bg-amber-500/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5">
                    <EyeOff size={12} /> Hidden from users
                  </div>
                )}
              </div>
              {car.images && car.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {car.images.map((url: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeMediaIndex === idx
                          ? "border-blue-500 opacity-100"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      {isVideo(url) ? (
                        <video src={url} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <img src={url} className="w-full h-full object-cover" alt="" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Pricing */}
            <section className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Pricing</h3>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                <SpecRow icon={<DollarSign size={16} />} label="Asking Price" value={`${car.price?.toLocaleString()} DH`} />
                {car.pricePerDay && (
                  <SpecRow icon={<Calendar size={16} />} label="Price / Day" value={`${car.pricePerDay?.toLocaleString()} DH`} />
                )}
                <SpecRow icon={<Eye size={16} />} label="Total Views" value={car.views?.toLocaleString() ?? "0"} />
              </div>
            </section>

            {/* Specs */}
            <section className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Specifications</h3>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                <SpecRow icon={<Tag size={16} />} label="Brand / Model" value={`${car.brand} ${car.model}`} />
                <SpecRow icon={<Calendar size={16} />} label="Year" value={car.year} />
                <SpecRow icon={<Gauge size={16} />} label="Mileage" value={car.mileage ? `${Number(car.mileage).toLocaleString()} km` : "N/A"} />
                <SpecRow icon={<MapPin size={16} />} label="City" value={car.city ?? "N/A"} />
                <SpecRow icon={<Settings2 size={16} />} label="Transmission" value={car.transmission ?? "N/A"} />
                <SpecRow icon={<Fuel size={16} />} label="Fuel Type" value={car.fuelType ?? "N/A"} />
                <SpecRow icon={<Activity size={16} />} label="Condition" value={car.condition ?? "N/A"} />
              </div>
            </section>

            {/* Description */}
            {car.description && (
              <section className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {car.description}
                </p>
              </section>
            )}

            {/* Seller */}
            {(car.user || car.User) && (() => {
              const seller = car.user || car.User;
              return (
                <section className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Seller</h3>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0">
                      {seller.photo ? (
                        <img src={seller.photo} alt={seller.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={18} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{seller.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        Member since {new Date(seller.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>
                </section>
              );
            })()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-red-700">
                Delete permanently? This cannot be undone.
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete?.(car); onClose(); }}
                  className="px-3 py-1.5 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={12} /> Confirm
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(car.id, !car.isHidden)}
                disabled={isUpdating}
                className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                  car.isHidden
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                {isUpdating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : car.isHidden ? (
                  <><Eye size={15} /> Show Listing</>
                ) : (
                  <><EyeOff size={15} /> Hide Listing</>
                )}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="py-2.5 px-3 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Delete Listing"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const SpecRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-slate-400">{icon}</span>
    <span className="font-medium text-slate-500 w-28 shrink-0">{label}</span>
    <span className="font-bold text-slate-900 truncate">{value}</span>
  </div>
);
