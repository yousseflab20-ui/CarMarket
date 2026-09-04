import { X, Filter } from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";

export interface CarsFilters {
  status: string;
  brand: string;
  city: string;
  condition: string;
}

interface CarsFilterBarProps {
  filters: CarsFilters;
  onChange: (filters: CarsFilters) => void;
  uniqueBrands: string[];
  uniqueCities: string[];
  totalCount: number;
  filteredCount: number;
}

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap relative z-40">
        {/* Label */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
          <Filter size={13} />
          Filter
        </div>

        {/* Status */}
        <SearchableSelect
          value={filters.status}
          onChange={(val) => set("status", val)}
          options={["AVAILABLE", "SOLD", "RESERVED"]}
          defaultLabel="All Status"
          placeholder="Search status..."
        />

        {/* Brand */}
        <SearchableSelect
          value={filters.brand}
          onChange={(val) => set("brand", val)}
          options={uniqueBrands}
          defaultLabel="All Brands"
          placeholder="Search brand..."
        />

        {/* City */}
        <SearchableSelect
          value={filters.city}
          onChange={(val) => set("city", val)}
          options={uniqueCities}
          defaultLabel="All Cities"
          placeholder="Search city..."
        />

        {/* Condition */}
        <SearchableSelect
          value={filters.condition}
          onChange={(val) => set("condition", val)}
          options={["Excellent", "Good", "Damaged"]}
          defaultLabel="All Conditions"
          placeholder="Search condition..."
        />

        {/* Clear all */}
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
