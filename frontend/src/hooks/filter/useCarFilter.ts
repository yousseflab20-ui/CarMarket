import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Animated, useWindowDimensions } from "react-native";
import { useNotificationStore } from "../../store/notificationStore";
import { searchCars } from "../../service/car/api";
import { createSavedSearch } from "../../service/savedSearch/endpointSavedSearch";
import { Car } from "../../types/car";
import { CarFilters } from "../../types/screens/carScreen";

const DEFAULT_FILTERS: CarFilters = {
  brand: "",
  minPrice: "",
  maxPrice: "",
  city: "",
  year: "",
  transmission: "",
  search: "",
};

interface UseCarFilterOptions {
  cars: Car[] | undefined;
}

export function useCarFilter({ cars }: UseCarFilterOptions) {
  const pushToken = useNotificationStore((state) => state.pushToken);
  const { height } = useWindowDimensions();

  const [filteredData, setFilteredData] = useState<Car[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<CarFilters>(DEFAULT_FILTERS);

  // Slide-up animation for the filter modal
  const filterModalAnim = useRef(new Animated.Value(height)).current;

  const closeFilterModal = useCallback(() => {
    Animated.timing(filterModalAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsFilterVisible(false));
  }, [filterModalAnim, height]);

  useEffect(() => {
    if (isFilterVisible) {
      filterModalAnim.setValue(height);
      Animated.spring(filterModalAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
        mass: 0.8,
      }).start();
    }
  }, [isFilterVisible, filterModalAnim, height]);

  const buildQuery = () => {
    const params: string[] = [];
    if (selectedBrand && selectedBrand !== "All")
      params.push(`brand=${encodeURIComponent(selectedBrand)}`);
    if (filters.minPrice)
      params.push(`minPrice=${encodeURIComponent(filters.minPrice)}`);
    if (filters.maxPrice)
      params.push(`maxPrice=${encodeURIComponent(filters.maxPrice)}`);
    if (filters.year)
      params.push(`year=${encodeURIComponent(filters.year)}`);
    if (filters.city && filters.city !== "All")
      params.push(`city=${encodeURIComponent(filters.city)}`);
    if (filters.transmission)
      params.push(`transmission=${encodeURIComponent(filters.transmission)}`);
    const activeSearch = searchQuery || filters.search;
    if (activeSearch)
      params.push(`search=${encodeURIComponent(activeSearch)}`);
    return params.join("&");
  };

  const applySearch = async () => {
    setIsSearching(true);
    try {
      const query = buildQuery();
      const results = await searchCars(query);
      const data = Array.isArray(results) ? results : (results?.data ?? []);
      setFilteredData(data);
      await createSavedSearch({
        pushToken: pushToken,
        brand: selectedBrand !== "All" ? selectedBrand : filters.brand || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        city: filters.city !== "All" ? filters.city : undefined,
        year: filters.year || undefined,
        transmission: filters.transmission || undefined,
        search: searchQuery || filters.search || undefined,
      });
      closeFilterModal();
    } catch (err) {
      console.error("Filter error: ", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setSelectedBrand("All");
    setFilteredData(null);
  };

  const filteredCars = useMemo(() => {
    return (filteredData || (cars as Car[]) || [])
      .filter(
        (car: Car) =>
          (car.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            car.brand?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (selectedBrand === "All" ||
            car.brand?.toLowerCase() === selectedBrand.toLowerCase()),
      )
      .sort(
        (a: Car, b: Car) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [filteredData, cars, searchQuery, selectedBrand]);

  return {
    // state
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    selectedBrand,
    setSelectedBrand,
    isFilterVisible,
    setIsFilterVisible,
    isSearching,
    filteredCars,
    // animation
    filterModalAnim,
    closeFilterModal,
    // actions
    applySearch,
    clearFilters,
  };
}
