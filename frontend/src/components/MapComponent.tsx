import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  Map,
  Camera,
  LogManager,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useLocation } from "../hooks/useLocation";
import {
  LocateFixed,
  Settings2,
  CalendarDays,
  SlidersHorizontal,
  Plus,
  X,
} from "lucide-react-native";
import { getCarsForMap, searchCars } from "../service/car/api";
import { useRouter } from "expo-router";
import { CarFilters } from "../types/screens/carScreen";
import { Car } from "../types/car";
import { createSavedSearch } from "../service/savedSearch/endpointSavedSearch";
import { useNotificationStore } from "../store/notificationStore";
import { MOROCCAN_CITIES } from "../types/screens/carForm";

LogManager.setLogLevel("error");
LogManager.onLog(() => true);

function CarImageMarker({ car }: { car: any }) {
  let imageUrl = "https://via.placeholder.com/150"; // Fallback image to prevent empty URI crash
  if (car.images) {
    try {
      const parsedImages =
        typeof car.images === "string" ? JSON.parse(car.images) : car.images;
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        imageUrl = parsedImages[0] || imageUrl;
      }
    } catch (e) {
      console.log("Error parsing image for marker", e);
    }
  }

  const formattedPrice =
    car.price >= 1000 ? `${(car.price / 1000).toFixed(0)}k` : `${car.price}`;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Map Pin Container */}
      <View
        style={{
          width: 48,
          height: 48,
          backgroundColor: "#3B82F6", // Primary blue border
          borderRadius: 24,
          padding: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Circular Image Wrapper to prevent Fresco SIGSEGV with borderRadius */}
        <View style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden", backgroundColor: "#E4E4E7" }}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 44, height: 44 }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Pin Arrow (Triangle pointing down) */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#3B82F6",
          marginTop: -1,
        }}
      />

      {/* Price Badge floating below the pin */}
      <View
        style={{
          backgroundColor: "#18181B",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: "#3B82F6",
          marginTop: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 10,
            fontFamily: "Lexend_700Bold",
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {formattedPrice} DH
        </Text>
      </View>
    </View>
  );
}

export default function MapComponent() {
  const { height } = Dimensions.get("window");
  const { t } = useTranslation();
  const router = useRouter();
  const {
    getLocation,
    isLoading: isLocating,
    error: locationError,
  } = useLocation();

  const cameraRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [cars, setCars] = useState<any[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const boundsTimeoutRef = useRef<any>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const lastMarkerPress = useRef<number>(0);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({
    brand: "",
    minPrice: "",
    maxPrice: "",
    city: "",
    year: "",
    transmission: "",
    search: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filteredData, setFilteredData] = useState<Car[] | null>(null);
  const pushToken = useNotificationStore((state) => state.pushToken);

  // Bottom Sheet animation
  const bottomSheetAnim = useRef(new Animated.Value(300)).current;

  const dismissBottomSheet = useCallback(() => {
    Animated.timing(bottomSheetAnim, {
      toValue: 300,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setSelectedCar(null));
  }, [bottomSheetAnim]);

  // Swipe-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only claim the responder if the user is swiping down significantly
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          bottomSheetAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Dismiss if swiped down far enough or fast enough
        if (gestureState.dy > 120 || gestureState.vy > 1.2) {
          dismissBottomSheet();
        } else {
          // Otherwise spring back to expanded
          Animated.spring(bottomSheetAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 180,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (selectedCar) {
      // Reset position then spring up
      bottomSheetAnim.setValue(300);
      Animated.spring(bottomSheetAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
        mass: 0.8,
      }).start();
    }
  }, [selectedCar]);
  // Initial fetch - load all cars with coordinates on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setIsLoadingCars(true);
        const data = await getCarsForMap();
        setCars(data ?? []);
        console.log("Fetched initial cars for map:", data);
      } catch (err) {
        console.log("Error initial fetch:", err);
      } finally {
        setIsLoadingCars(false);
      }
    };
    fetchInitial();
  }, []);

  // Fetch cars when map region changes (debounced 500ms)
  const handleRegionDidChange = useCallback(async (feature: any) => {
    // Auto-close FAB menu when map moves (using functional update to avoid stale closures)
    setIsFabExpanded((prev) => (prev ? false : prev));

    if (boundsTimeoutRef.current) clearTimeout(boundsTimeoutRef.current);

    boundsTimeoutRef.current = setTimeout(async () => {
      try {
        const bbox = feature?.properties?.visibleBounds;
        if (!bbox) return;

        const [sw, ne] = bbox;
        const [minLng, minLat] = sw;
        const [maxLng, maxLat] = ne;

        setIsLoadingCars(true);
        const data = await getCarsForMap({ minLat, maxLat, minLng, maxLng });
        
        // Prevent unnecessary re-renders that crash MapLibre GL Thread
        setCars((prevCars) => {
          const newData = data ?? [];
          if (prevCars.length === newData.length && prevCars.every((c, i) => c.id === newData[i].id)) {
            return prevCars;
          }
          return newData;
        });
        
        console.log(`Fetched ${data?.length || 0} cars for map region.`);
      } catch (err) {
        console.log("Error fetching cars for map:", err);
      } finally {
        setIsLoadingCars(false);
      }
    }, 500);
  }, []);

  const handleLocateMe = async () => {
    const coords = await getLocation();
    if (coords) {
      const newLoc: [number, number] = [coords.longitude, coords.latitude];
      setUserLocation(newLoc);
      cameraRef.current?.flyTo({
        center: newLoc,
        zoom: 14,
        duration: 1000,
      });
    } else if (locationError) {
      Alert.alert("Error", locationError);
    }
  };

  const buildQuery = () => {
    const params = [];
    if (selectedBrand && selectedBrand !== "All") params.push(`brand=${encodeURIComponent(selectedBrand)}`);
    if (filters.minPrice) params.push(`minPrice=${encodeURIComponent(filters.minPrice)}`);
    if (filters.maxPrice) params.push(`maxPrice=${encodeURIComponent(filters.maxPrice)}`);
    if (filters.year) params.push(`year=${encodeURIComponent(filters.year)}`);
    if (filters.city && filters.city !== "All") params.push(`city=${encodeURIComponent(filters.city)}`);
    if (filters.transmission) params.push(`transmission=${encodeURIComponent(filters.transmission)}`);
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
    return params.join("&");
  };

  const applySearch = async () => {
    setIsSearching(true);
    try {
      const query = buildQuery();
      const results = await searchCars(query);
      const data = Array.isArray(results) ? results : (results?.data ?? []);
      setCars(data); // Important: updates the map!
      await createSavedSearch({
        pushToken: pushToken,
        brand:
          selectedBrand !== "All" ? selectedBrand : filters.brand || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        city: filters.city !== "All" ? filters.city : undefined,
        year: filters.year || undefined,
        transmission: filters.transmission || undefined,
        search: searchQuery || filters.search || undefined,
      });
      setIsFilterVisible(false);
    } catch (err) {
      console.error("Filter error: ", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = async () => {
    setFilters({
      brand: "",
      minPrice: "",
      maxPrice: "",
      city: "",
      year: "",
      transmission: "",
      search: "",
    });
    setSearchQuery("");
    setSelectedBrand("All");
    
    // Refresh cars from backend to restore all map pins
    try {
      setIsLoadingCars(true);
      const data = await getCarsForMap();
      setCars(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCars(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Map
        style={{ flex: 1 }}
        androidView="texture"
        mapStyle={`https://api.maptiler.com/maps/outdoor-v4/style.json?key=mKautShoxe78ion42mlg`}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionDidChange={handleRegionDidChange}
        onPress={() => {
          // Prevent map tap from closing if a marker was just tapped (< 500ms ago)
          if (Date.now() - lastMarkerPress.current > 500) {
            dismissBottomSheet();
          }
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [-9.5981, 30.4278],
            zoom: 12,
          }}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker id="user-location" lngLat={userLocation}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#3B82F6",
                borderWidth: 3,
                borderColor: "#FFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }}
            />
          </Marker>
        )}

        {/* Car price markers */}
        {cars.map((car) => {
          const lng = Number(car.longitude);
          const lat = Number(car.latitude);
          if (isNaN(lng) || isNaN(lat)) return null;

          return (
            <Marker
              key={`car-${car.id}`}
              id={`car-${car.id}`}
              lngLat={[lng, lat]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  width: 100,
                  height: 100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  lastMarkerPress.current = Date.now();
                  setSelectedCar(car);
                }}
              >
                <CarImageMarker car={car} />
              </TouchableOpacity>
            </Marker>
          );
        })}
      </Map>

      {/* Modern Bottom Sheet for selected car - Animated Slide Up */}
      {selectedCar && (
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY: bottomSheetAnim }],
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: "#18181B",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 20,
              borderTopWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 20,
            }}
          >
            {/* Draggable Handle - tap to dismiss */}
            <TouchableOpacity onPress={dismissBottomSheet} style={{ alignItems: "center", paddingBottom: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: "#3F3F46",
                }}
              />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{
                  uri:
                    typeof selectedCar.images === "string"
                      ? JSON.parse(selectedCar.images)[0]
                      : selectedCar.images?.[0] ||
                        "https://via.placeholder.com/150",
                }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 18,
                  backgroundColor: "#27272A",
                }}
                resizeMode="cover"
              />

              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontFamily: "Lexend_700Bold",
                    marginBottom: 6,
                  }}
                  numberOfLines={1}
                >
                  {selectedCar.brand} {selectedCar.model}
                </Text>

                {/* Tags / Chips */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#27272A",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <CalendarDays size={12} color="#94A3B8" />
                    <Text
                      style={{
                        color: "#94A3B8",
                        fontSize: 11,
                        fontFamily: "Lexend_500Medium",
                        marginLeft: 4,
                      }}
                    >
                      {selectedCar.year || "N/A"}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#27272A",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Settings2 size={12} color="#94A3B8" />
                    <Text
                      style={{
                        color: "#94A3B8",
                        fontSize: 11,
                        fontFamily: "Lexend_500Medium",
                        marginLeft: 4,
                      }}
                    >
                      {selectedCar.transmission || "Auto"}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: "#3B82F6",
                    fontSize: 18,
                    fontFamily: "Lexend_700Bold",
                  }}
                >
                  {selectedCar.price >= 1000
                    ? `${(selectedCar.price / 1000).toFixed(0)}k`
                    : selectedCar.price}{" "}
                  DH
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                marginTop: 20,
                backgroundColor: "#3B82F6",
                height: 54,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/CarDetailScreen",
                  params: {
                    car: JSON.stringify(selectedCar),
                    user: JSON.stringify(
                      selectedCar.User || selectedCar.user || null,
                    ),
                    user2Id: selectedCar.userId?.toString() || "",
                  },
                })
              }
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  fontFamily: "Lexend_700Bold",
                }}
              >
                {t("carDetail.contact")}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Loading indicator */}
      {isLoadingCars && (
        <View
          style={{
            position: "absolute",
            top: 16,
            alignSelf: "center",
            backgroundColor: "#18181B",
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 12,
              fontFamily: "Lexend_400Regular",
            }}
          >
            {t("common.loading")}
          </Text>
        </View>
      )}

      {/* Floating Action Button (FAB) Menu */}
      <View
        style={{
          position: "absolute",
          bottom: selectedCar ? 260 : 24,
          right: 16,
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Expanded Items */}
        {isFabExpanded && (
          <>
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#18181B",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }}
              onPress={() => {
                setIsFabExpanded(false);
                setIsFilterVisible(true);
              }}
              activeOpacity={0.8}
            >
              <SlidersHorizontal size={20} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#18181B",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }}
              onPress={() => {
                setIsFabExpanded(false);
                handleLocateMe();
              }}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <LocateFixed size={20} color="#3B82F6" />
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Main FAB Toggle */}
        <TouchableOpacity
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: isFabExpanded ? "#18181B" : "#3B82F6",
            borderWidth: isFabExpanded ? 1 : 0,
            borderColor: "rgba(255,255,255,0.1)",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: isFabExpanded ? "#000" : "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: 6,
          }}
          onPress={() => setIsFabExpanded(!isFabExpanded)}
          activeOpacity={0.8}
        >
          {isFabExpanded ? (
            <X size={24} color="#FFF" />
          ) : (
            <Plus size={24} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            className="bg-[#161921] rounded-t-[32px] px-7 pt-6"
            style={{ maxHeight: height * 0.85 }}
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text
                className="text-white text-[22px] tracking-[0.5px]"
                style={{ fontFamily: "Lexend_700Bold" }}
              >
                {t("carScreen.filters")}
              </Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={clearFilters}>
                  <Text className="text-red-500 text-sm" style={{ fontFamily: "Lexend_500Medium" }}>{t("carScreen.clearFilters")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFilterVisible(false)}
                  className="w-10 h-10 rounded-full bg-white/5 items-center justify-center"
                >
                  <X size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              <Text
                className="text-white text-base mb-3.5 mt-6"
                style={{ fontFamily: "Lexend_600SemiBold" }}
              >
                {t("carScreen.priceRange")}
              </Text>
              <View className="flex-row items-center justify-between">
                <TextInput
                  className="flex-1 bg-[#09090B] border border-white/8 rounded-2xl p-4 text-white text-[15px]"
                  style={{ fontFamily: "Lexend_500Medium" }}
                  placeholder={t("carScreen.minPrice")}
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={filters.minPrice}
                  onChangeText={(text) =>
                    setFilters({ ...filters, minPrice: text })
                  }
                />
                <View className="w-3.5 h-[2px] bg-slate-500 mx-3 rounded-[2px]" />
                <TextInput
                  className="flex-1 bg-[#09090B] border border-white/8 rounded-2xl p-4 text-white text-[15px]"
                  style={{ fontFamily: "Lexend_500Medium" }}
                  placeholder={t("carScreen.maxPrice")}
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={filters.maxPrice}
                  onChangeText={(text) =>
                    setFilters({ ...filters, maxPrice: text })
                  }
                />
              </View>
              <Text
                className="text-white text-base mb-3.5 mt-6"
                style={{ fontFamily: "Lexend_600SemiBold" }}
              >
                {t("carScreen.modelYear")}
              </Text>
              <TextInput
                className="w-full bg-[#09090B] border border-white/8 rounded-2xl p-4 text-white text-[15px]"
                style={{ fontFamily: "Lexend_500Medium" }}
                placeholder={t("carScreen.yearPlaceholder")}
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={filters.year}
                onChangeText={(text) => setFilters({ ...filters, year: text })}
              />
              <Text
                className="text-white text-base mb-3.5 mt-6"
                style={{ fontFamily: "Lexend_600SemiBold" }}
              >
                {t("carScreen.transmission")}
              </Text>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className={[
                    "flex-1 bg-[#09090B] border border-white/8 rounded-2xl p-4 items-center mx-1.5",
                    filters.transmission === "Automatic"
                      ? "bg-blue-500/10 border-blue-500/40"
                      : "",
                  ].join(" ")}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      transmission:
                        filters.transmission === "Automatic" ? "" : "Automatic",
                    })
                  }
                >
                  <Text
                    className="text-slate-400 text-[15px]"
                    style={[
                      { fontFamily: "Lexend_600SemiBold" },
                      filters.transmission === "Automatic" && {
                        color: "#3B82F6",
                      },
                    ]}
                  >
                    {t("carScreen.automatic")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={[
                    "flex-1 bg-[#09090B] border border-white/8 rounded-2xl p-4 items-center mx-1.5",
                    filters.transmission === "Manual"
                      ? "bg-blue-500/10 border-blue-500/40"
                      : "",
                  ].join(" ")}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      transmission:
                        filters.transmission === "Manual" ? "" : "Manual",
                    })
                  }
                >
                  <Text
                    className="text-slate-400 text-[15px]"
                    style={[
                      { fontFamily: "Lexend_600SemiBold" },
                      filters.transmission === "Manual" && { color: "#3B82F6" },
                    ]}
                  >
                    {t("carScreen.manual")}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                className="text-white text-base mb-3.5 mt-6"
                style={{ fontFamily: "Lexend_600SemiBold" }}
              >
                {t("carScreen.city")}
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {["All", ...MOROCCAN_CITIES].map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    className={[
                      "bg-[#09090B] px-4.5 py-3 rounded-full border border-white/8",
                      filters.city === c
                        ? "bg-blue-500/10 border-blue-500/40"
                        : "",
                    ].join(" ")}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        city: filters.city === c ? "" : c,
                      })
                    }
                  >
                    <Text
                      className="text-slate-400 text-sm"
                      style={[
                        { fontFamily: "Lexend_500Medium" },
                        filters.city === c && { color: "#3B82F6" },
                      ]}
                    >
                      {t(`carScreen.cities.${c.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="border-t border-white/8 pt-4 pb-7 mt-2.5">
              <TouchableOpacity
                className="bg-blue-500 py-4.5 rounded-[20px] items-center"
                style={{
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
                }}
                onPress={applySearch}
                disabled={isSearching}
              >
                <Text
                  className="text-white text-base tracking-[0.5px]"
                  style={{ fontFamily: "Lexend_700Bold" }}
                >
                  {isSearching
                    ? t("carScreen.searching")
                    : t("carScreen.showVehicles")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
