export interface CarsFilters {
  status: string;
  brand: string;
  city: string;
  condition: string;
}

export interface CarsFilterBarProps {
  filters: CarsFilters;
  onChange: (filters: CarsFilters) => void;
  uniqueBrands: string[];
  uniqueCities: string[];
  totalCount: number;
  filteredCount: number;
}
