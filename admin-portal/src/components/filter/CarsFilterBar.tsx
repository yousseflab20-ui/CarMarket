import { X, Filter } from "lucide-react";
import type {
  CarsFilterBarProps,
  CarsFilters,
} from "../../types/filter/typeCarsFilter";
export const CarsFilterBar = ({
  filters,
  onChange,
  uniqueBrands,
  uniqueCities,
  totalCount,
  filteredCount,
}: CarsFilterBarProps) => {
  const set = (key: keyof CarsFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  const activeCount = Object.values(filters).filter((v) => v !== "ALL").length;

  const clearAll = () =>
    onChange({ status: "ALL", brand: "ALL", city: "ALL", condition: "ALL" });

  const selectClass =
    "bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
          <Filter size={13} />
          Filter
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => set("status", e.target.value)}
          className={selectClass}
        >
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="SOLD">Sold</option>
          <option value="RESERVED">Reserved</option>
        </select>

        {/* Brand */}
        <select
          value={filters.brand}
          onChange={(e) => set("brand", e.target.value)}
          className={selectClass}
        >
          <option value="ALL">All Brands</option>
          {uniqueBrands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* City */}
        <select
          value={filters.city}
          onChange={(e) => set("city", e.target.value)}
          className={selectClass}
        >
          <option value="ALL">All Cities</option>
          {uniqueCities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Condition */}
        <select
          value={filters.condition}
          onChange={(e) => set("condition", e.target.value)}
          className={selectClass}
        >
          <option value="ALL">All Conditions</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Damaged">Damaged</option>
        </select>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X size={12} />
            Clear ({activeCount})
          </button>
        )}
      </div>

      {/* Active filter badges */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.status !== "ALL" && (
            <ActiveBadge
              label={`Status: ${filters.status}`}
              onRemove={() => set("status", "ALL")}
            />
          )}
          {filters.brand !== "ALL" && (
            <ActiveBadge
              label={`Brand: ${filters.brand}`}
              onRemove={() => set("brand", "ALL")}
            />
          )}
          {filters.city !== "ALL" && (
            <ActiveBadge
              label={`City: ${filters.city}`}
              onRemove={() => set("city", "ALL")}
            />
          )}
          {filters.condition !== "ALL" && (
            <ActiveBadge
              label={`Condition: ${filters.condition}`}
              onRemove={() => set("condition", "ALL")}
            />
          )}
          <span className="text-[11px] font-bold text-slate-400 ml-1">
            {filteredCount} of {totalCount} results
          </span>
        </div>
      )}
    </div>
  );
};

const ActiveBadge = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[11px] font-bold">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-blue-900 transition-colors cursor-pointer"
    >
      <X size={10} />
    </button>
  </span>
);
