import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  Loader2,
  AlertCircle,
  Car,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ShieldBan,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserDetails } from "../services/queries";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRiskBadge } from "./UserRiskBadge";
import type { UserStatus, AdminUser } from "../types/user.types";

interface Props {
  userId: number | null;
  onClose: () => void;
  onChangeStatus: (user: AdminUser, targetStatus: UserStatus) => void;
}

export const UserDetailsDrawer = ({
  userId,
  onClose,
  onChangeStatus,
}: Props) => {
  const navigate = useNavigate();
  const [activeReportTab, setActiveReportTab] = useState<"ACCEPTED" | "REJECTED" | "PENDING">("ACCEPTED");
  const [activeCarTab, setActiveCarTab] = useState<"ACTIVE" | "SOLD" | "HIDDEN">("ACTIVE");

  const { data, isLoading, error } = useUserDetails(userId);

  if (!userId) return null;

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
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
              </div>
            </div>
          ) : data?.data ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                {data.data.user.photo ? (
                  <img
                    src={data.data.user.photo}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                    {data.data.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 truncate max-w-[200px]">
                  {data.data.user.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <UserStatusBadge status={data.data.user.status} />
                  <UserRiskBadge
                    risk={data.data.risk.riskLevel}
                    strikes={data.data.risk.acceptedReports}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-500 font-bold">Failed to load user</div>
          )}

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
          ) : (
            data?.data && (
              <>
                {/* Identity & Contact */}
                <section className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    👤 Identity & Contact
                  </h3>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {data.data.user.email}
                      </span>
                    </div>
                    {data.data.user.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={16} className="text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {data.data.user.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-700">
                        Joined{" "}
                        {new Date(data.data.user.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <BadgeCheck
                        size={16}
                        className={
                          data.data.user.verified
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }
                      />
                      <span
                        className={`font-medium ${data.data.user.verified ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        {data.data.user.verified
                          ? "Verified Identity"
                          : "Not Verified"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Reports History */}
                <section className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    ⚠️ Reports History
                  </h3>
                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={() => setActiveReportTab("ACCEPTED")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${activeReportTab === "ACCEPTED" ? "bg-red-50 text-red-600 border-red-200 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
                    >
                      {data.data.risk.acceptedReports} Accepted
                    </button>
                    <button 
                      onClick={() => setActiveReportTab("REJECTED")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${activeReportTab === "REJECTED" ? "bg-slate-100 text-slate-700 border-slate-300 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
                    >
                      {data.data.risk.rejectedReports} Rejected
                    </button>
                    <button 
                      onClick={() => setActiveReportTab("PENDING")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${activeReportTab === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-200 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
                    >
                      {data.data.risk.pendingReports} Pending
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {data.data.reports
                      .filter((r: any) => r.status === activeReportTab)
                      .map((report: any) => {
                        const targetCar = report.targetType === "CAR" 
                          ? data.data.cars.find((c: any) => c.id === report.targetId) 
                          : null;
                          
                        const statusColors = {
                          ACCEPTED: "text-red-500 bg-red-100 border-red-100",
                          REJECTED: "text-slate-500 bg-slate-200 border-slate-200",
                          PENDING: "text-amber-500 bg-amber-100 border-amber-100",
                        };
                        
                        const containerColors = {
                          ACCEPTED: "bg-red-50/50 border-red-100",
                          REJECTED: "bg-slate-50/50 border-slate-100",
                          PENDING: "bg-amber-50/50 border-amber-100",
                        };

                        return (
                          <div
                            key={report.id}
                            onClick={() => {
                              onClose();
                              navigate('/reports', { state: { openReportId: report.id } });
                            }}
                            className={`${containerColors[activeReportTab]} border rounded-xl p-3 flex flex-col gap-1 cursor-pointer hover:shadow-sm transition-all hover:scale-[1.01]`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-bold ${activeReportTab === 'ACCEPTED' ? 'text-red-700' : activeReportTab === 'PENDING' ? 'text-amber-700' : 'text-slate-700'}`}>
                                {report.reason}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${statusColors[activeReportTab]}`}>
                                {report.status}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium flex items-center justify-between">
                              <span>Target: {report.targetType} #{report.targetId} {targetCar ? `(${targetCar.brand} ${targetCar.model})` : ''}</span>
                              <ExternalLink size={12} className="opacity-50" />
                            </span>
                          </div>
                        );
                      })}
                    {data.data.reports.filter(
                      (r: any) => r.status === activeReportTab,
                    ).length === 0 && (
                      <div className="text-center py-4 text-xs font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                        No {activeReportTab.toLowerCase()} reports.
                      </div>
                    )}
                  </div>
                </section>

                {/* User's Garage */}
                <section className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    🚗 User's Garage
                  </h3>
                  
                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={() => setActiveCarTab("ACTIVE")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${activeCarTab === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
                    >
                      {data.data.cars.filter((c: any) => c.status === "AVAILABLE" && !c.isHidden).length} Active
                    </button>
                    <button 
                      onClick={() => setActiveCarTab("SOLD")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${activeCarTab === "SOLD" ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
                    >
                      {data.data.cars.filter((c: any) => c.status === "SOLD").length} Sold
                    </button>
                    <button 
                      onClick={() => setActiveCarTab("HIDDEN")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${activeCarTab === "HIDDEN" ? "bg-slate-100 text-slate-700 border-slate-300 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
                    >
                      {data.data.cars.filter((c: any) => c.isHidden).length} Hidden
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {data.data.cars
                      .filter((c: any) => {
                        if (activeCarTab === "ACTIVE") return c.status === "AVAILABLE" && !c.isHidden;
                        if (activeCarTab === "SOLD") return c.status === "SOLD";
                        if (activeCarTab === "HIDDEN") return c.isHidden === true;
                        return false;
                      })
                      .map((car: any) => (
                        <div 
                          key={car.id} 
                          onClick={() => {
                            onClose();
                            navigate('/cars', { state: { openCarId: car.id } });
                          }}
                          className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="aspect-video bg-slate-100 relative">
                            {car.images?.[0] ? (
                              <img src={car.images[0]} alt={car.brand} className="w-full h-full object-cover" />
                            ) : (
                              <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                            )}
                            {car.isHidden && (
                              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
                                <EyeOff size={20} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {car.brand} {car.model}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">{car.price.toLocaleString()} DH</p>
                          </div>
                        </div>
                    ))}
                    {data.data.cars.filter((c: any) => {
                        if (activeCarTab === "ACTIVE") return c.status === "AVAILABLE" && !c.isHidden;
                        if (activeCarTab === "SOLD") return c.status === "SOLD";
                        if (activeCarTab === "HIDDEN") return c.isHidden === true;
                        return false;
                    }).length === 0 && (
                      <div className="col-span-2 text-center py-6 text-xs font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                        No {activeCarTab.toLowerCase()} cars.
                      </div>
                    )}
                  </div>
                </section>
              </>
            )
          )}
        </div>

        {/* Footer Actions (Dynamic based on status) */}
        {data?.data && data.data.user.role !== "ADMIN" && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            {data.data.user.status === "ACTIVE" && (
              <>
                <button
                  onClick={() => onChangeStatus(data.data.user, "RESTRICTED")}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={16} /> Restrict
                </button>
                <button
                  onClick={() => onChangeStatus(data.data.user, "BLOCKED")}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldBan size={16} /> Block
                </button>
              </>
            )}

            {data.data.user.status === "RESTRICTED" && (
              <>
                <button
                  onClick={() => onChangeStatus(data.data.user, "ACTIVE")}
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} /> Restore
                </button>
                <button
                  onClick={() => onChangeStatus(data.data.user, "BLOCKED")}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldBan size={16} /> Block
                </button>
              </>
            )}

            {data.data.user.status === "BLOCKED" && (
              <button
                onClick={() => onChangeStatus(data.data.user, "ACTIVE")}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Unblock User
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
