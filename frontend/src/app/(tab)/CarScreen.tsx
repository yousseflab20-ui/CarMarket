import {
  View,
  StatusBar,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  Share,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useCarsQuery } from "../../service/car/queries";
import { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import {
  Search,
  Heart,
  Bell,
  User as UserIcon,
  Gauge,
  Users,
  Clock,
  LogOut,
  Edit,
  SlidersHorizontal,
  X,
  Trash2,
  GitCompare,
  Share2,
  CheckCircle,
  MapPinSearch,
  Flag,
  ChevronDown,
} from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../../service/favorite/endpointfavorite";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCompareStore } from "../../store/useCompareStore";
import {
  Menu,
  Pressable,
  Divider,
  Box,
  Icon,
  HStack,
  VStack,
} from "native-base";

import { searchCars, deleteCar } from "../../service/car/api";
import { Car } from "../../types/car";
import { Brand, CarFilters, CarCardProps } from "../../types/screens/carScreen";
import { useNotificationStore } from "../../store/notificationStore";
import { createSavedSearch } from "../../service/savedSearch/endpointSavedSearch";
import { MOROCCAN_CITIES } from "../../types/screens/carForm";
import { useStackedToastStore } from "../../store/stackedToastStore";
import { STATUS_CONFIG } from "../../utils/statusConfig";
import notificationService from "@/src/service/notification.service";

const BRANDS: Brand[] = [
  { id: 1, name: "BMW", icon: require("../../assets/image/Bmw.png") },
  { id: 2, name: "Mercedes", icon: require("../../assets/image/Mercedes.png") },
  { id: 3, name: "Bentley", icon: require("../../assets/image/Bentley.png") },
  { id: 4, name: "Audi", icon: require("../../assets/image/Audi.png") },
  { id: 5, name: "Toyota", icon: require("../../assets/image/Toyota.png") },
];

const { width, height } = Dimensions.get("window");

export default function CarScreen() {
  const { t } = useTranslation();
  const addToast = useStackedToastStore((state) => state.addToast);
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { cars: compareCars, clearAll, addCar, removeCar } = useCompareStore();
  const pushToken = useNotificationStore((state) => state.pushToken);

  // Local state for search results
  const [filteredData, setFilteredData] = useState<Car[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
  const brandModalAnim = useRef(new Animated.Value(height)).current;
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({
    brand: "",
    minPrice: "",
    maxPrice: "",
    city: "",
    year: "",
    transmission: "",
    search: "",
  });

  const closeBrandModal = useCallback(
    (brandName?: string) => {
      Animated.timing(brandModalAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIsBrandModalVisible(false);
        if (brandName) {
          setSelectedBrand(brandName);
        }
      });
    },
    [brandModalAnim, height],
  );

  useEffect(() => {
    if (isBrandModalVisible) {
      brandModalAnim.setValue(height);
      Animated.spring(brandModalAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
        mass: 0.8,
      }).start();
    }
  }, [isBrandModalVisible, brandModalAnim, height]);

  const queryClient = useQueryClient();
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    }, []),
  );

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: notificationService.getUnreadCount,
  });

  console.log("Unread notifications count:", unreadCount);

  const { data: cars, isLoading, isError, error } = useCarsQuery();
  const { data: favorites } = useQuery<any[], Error>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await getFavorites();
      return res.All;
    },
    enabled: !!user,
  });
  const addFavoriteMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const toggleLike = (carId: number) => {
    const alreadyLiked = favorites?.some((f: any) => f.carId === carId);
    if (alreadyLiked) removeFavoriteMutation.mutate(carId);
    else addFavoriteMutation.mutate(carId);
  };

  const isLiked = useCallback(
    (carId: number): boolean => {
      return !!favorites?.some((f: any) => f.carId === carId);
    },
    [favorites],
  );

  const filteredCars = useMemo(() => {
    const base = (filteredData || (cars as Car[]) || [])
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
    return base;
  }, [filteredData, cars, searchQuery, selectedBrand]);

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      console.log("✅ Delete success triggered");
      addToast({
        title: "Deleted",
        description: "Car deleted successfully",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (error) => {
      console.log("❌ Delete error triggered:", error);
      addToast({
        title: "Error",
        description: "Failed to delete",
        type: "error",
      });
    },
  });

  const renderCarItem = useCallback(
    ({ item }: { item: Car }) => (
      <CarCard
        item={item}
        width={width}
        isLiked={isLiked}
        toggleLike={toggleLike}
        user={user}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    ),
    [width, isLiked, toggleLike, user, deleteMutation],
  );

  useEffect(() => {
    if (!user) {
      router.replace("/HomeScreen");
    }
  }, [user]);

  const buildQuery = () => {
    const params = [];
    if (selectedBrand && selectedBrand !== "All")
      params.push(`brand=${encodeURIComponent(selectedBrand)}`);
    if (filters.minPrice)
      params.push(`minPrice=${encodeURIComponent(filters.minPrice)}`);
    if (filters.maxPrice)
      params.push(`maxPrice=${encodeURIComponent(filters.maxPrice)}`);
    if (filters.year) params.push(`year=${encodeURIComponent(filters.year)}`);
    if (filters.city && filters.city !== "All")
      params.push(`city=${encodeURIComponent(filters.city)}`);
    if (filters.transmission)
      params.push(`transmission=${encodeURIComponent(filters.transmission)}`);
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
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

  const clearFilters = () => {
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
    setFilteredData(null);
  };

  if (isLoading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090B",
        }}
      >
        <Text
          className="text-base text-slate-400"
          style={{ fontFamily: "Lexend_400Regular" }}
        >
          {t("carScreen.loading")}
        </Text>
      </SafeAreaView>
    );
  if (isError)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090B",
        }}
      >
        <Text
          className="text-base text-red-500"
          style={{ fontFamily: "Lexend_500Medium" }}
        >
          {t("carScreen.error")}: {error?.message}
        </Text>
      </SafeAreaView>
    );
  if (!user)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090B",
        }}
      >
        <Text
          className="text-white"
          style={{ fontFamily: "Lexend_400Regular" }}
        >
          {t("carScreen.loadingUser")}
        </Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-5">
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-[#18181B] justify-center items-center relative"
          onPress={() =>
            router.push({
              pathname: "/ProfileUser",
              params: { user2Id: user.id },
            })
          }
        >
          <Image
            source={{ uri: user.photo }}
            className="w-full h-full rounded-2xl"
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text
            className="text-white text-lg opacity-90"
            style={{ fontFamily: "Lexend_600SemiBold" }}
          >
            {t("carScreen.searchHeader")}
          </Text>
        </View>

        <TouchableOpacity
          className="w-12 h-12 rounded-[18px] bg-[#18181B] justify-center items-center border border-blue-500/15"
          onPress={() => router.push("/NotificationsScreen")}
        >
          <View className="w-8 h-8 justify-center items-center">
            <Bell size={20} color="#fff" />
            {unreadCount?.count > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 justify-center items-center px-1 border border-[#09090B]">
                <Text
                  className="text-white text-[10px]"
                  style={{ fontFamily: "Lexend_700Bold" }}
                >
                  {unreadCount.count > 9 ? "9+" : unreadCount.count}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View className="px-5 mb-5">
        <View className="flex-row items-center bg-[#18181B] h-[54px] rounded-2xl px-4 gap-3">
          <Search size={20} color="#94A3B8" />
          <TextInput
            placeholder={t("carScreen.searchPlaceholder")}
            placeholderTextColor="#64748B"
            className="flex-1 text-white text-[15px]"
            style={{ fontFamily: "Lexend_400Regular" }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={() => setIsFilterVisible(true)}
            className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"
          >
            <SlidersHorizontal size={20} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/MapSearchScreen")}
            className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"
          >
            <MapPinSearch size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 mb-5 flex-row items-center justify-between">
        <Text
          className="text-[15px] text-slate-400 uppercase tracking-widest"
          style={{ fontFamily: "Lexend_600SemiBold" }}
        >
          {t("carScreen.category")}
        </Text>
        <TouchableOpacity
          onPress={() => setIsBrandModalVisible(true)}
          className="flex-row items-center bg-[#18181B] border border-white/5 px-4 py-2 rounded-full"
          activeOpacity={0.7}
        >
          <Text
            className="text-blue-500 mr-2 text-[13px]"
            style={{ fontFamily: "Lexend_600SemiBold" }}
          >
            {selectedBrand === "All" ? t("carScreen.all") : selectedBrand}
          </Text>
          <ChevronDown size={14} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCarItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

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
                  <Text
                    className="text-red-500 text-sm"
                    style={{ fontFamily: "Lexend_500Medium" }}
                  >
                    {t("carScreen.clearFilters")}
                  </Text>
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
      {/* Brand Selection Modal */}
      <Modal
        visible={isBrandModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => closeBrandModal()}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          activeOpacity={1}
          onPress={() => closeBrandModal()}
        >
          <Animated.View
            className="bg-[#161921] rounded-t-[32px] px-6 pt-6 pb-8"
            style={{ transform: [{ translateY: brandModalAnim }] }}
          >
            {/* Prevent touch propagation to the backdrop */}
            <TouchableOpacity activeOpacity={1}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 48,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: "#3F3F46",
                  }}
                />
              </View>
              <Text
                className="text-white text-xl mb-6 text-center"
                style={{ fontFamily: "Lexend_700Bold" }}
              >
                Select a Brand
              </Text>

              <View className="flex-row flex-wrap justify-between gap-y-4">
                <TouchableOpacity
                  className={[
                    "w-[30%] items-center justify-center py-4 rounded-2xl border",
                    selectedBrand === "All"
                      ? "bg-blue-500/10 border-blue-500"
                      : "bg-[#18181B] border-white/5",
                  ].join(" ")}
                  onPress={() => closeBrandModal("All")}
                >
                  <Text className="text-2xl mb-2">🌟</Text>
                  <Text
                    className={
                      selectedBrand === "All"
                        ? "text-blue-500"
                        : "text-slate-400"
                    }
                    style={{ fontFamily: "Lexend_600SemiBold", fontSize: 13 }}
                  >
                    {t("carScreen.all")}
                  </Text>
                </TouchableOpacity>

                {BRANDS.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    className={[
                      "w-[30%] items-center justify-center py-4 rounded-2xl border",
                      selectedBrand === brand.name
                        ? "bg-blue-500/10 border-blue-500"
                        : "bg-[#18181B] border-white/5",
                    ].join(" ")}
                    onPress={() => closeBrandModal(brand.name)}
                  >
                    <Image
                      source={brand.icon}
                      style={{
                        width: 32,
                        height: 32,
                        resizeMode: "contain",
                        marginBottom: 8,
                      }}
                    />
                    <Text
                      className={
                        selectedBrand === brand.name
                          ? "text-blue-500"
                          : "text-slate-400"
                      }
                      style={{ fontFamily: "Lexend_600SemiBold", fontSize: 13 }}
                    >
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function CarCardComponent({
  item,
  width,
  isLiked,
  toggleLike,
  user,
  onDelete,
}: CarCardProps) {
  const { t } = useTranslation();
  const { cars: compareCars, addCar, removeCar } = useCompareStore();
  const isSelected = useMemo(
    () => compareCars.some((c) => c.id === item.id),
    [compareCars, item.id],
  );
  const isFull = useMemo(
    () => compareCars.length >= 3 && !isSelected,
    [compareCars, isSelected],
  );

  const onCompareSelect = useCallback(() => {
    if (isSelected) removeCar(item.id);
    else if (!isFull) addCar(item);
  }, [isSelected, isFull, item, addCar, removeCar]);

  const images =
    item.images && item.images.length > 0
      ? item.images
      : ["https://via.placeholder.com/400x300?text=No+Image"];
  const [activeImg, setActiveImg] = useState(0);
  const cardWidth = width - 40;
  const status =
    STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.available;
  const liked = isLiked(item.id);

  return (
    <TouchableOpacity
      className={[
        "bg-[#18181B] rounded-[28px] mb-5 border-2 border-transparent overflow-hidden",
        isSelected ? "border-blue-500" : "",
      ].join(" ")}
      activeOpacity={0.9}
      style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      }}
      onPress={() =>
        router.push({
          pathname: "/CarDetailScreen",
          params: {
            car: JSON.stringify(item),
            user: JSON.stringify(item.User || item.user || null),
            user2Id: item.userId?.toString() || "",
          },
        })
      }
    >
      <View className="h-[200px] relative">
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
            setActiveImg(idx);
          }}
          keyExtractor={(img, index) => index.toString()}
          renderItem={({ item: img }) => (
            <Image
              source={{ uri: img }}
              className="h-full rounded-xl"
              style={{ width: cardWidth }}
              resizeMode="cover"
            />
          )}
        />
        {images.length > 1 && (
          <View className="absolute bottom-3.5 left-0 right-0 flex-row justify-center gap-1.5">
            {images.map((_: any, i: number) => (
              <View
                key={i}
                className={[
                  "w-1.5 h-1.5 rounded-full bg-white/40",
                  i === activeImg ? "w-4 bg-white" : "",
                ].join(" ")}
              />
            ))}
          </View>
        )}
        <View
          className="absolute top-4 left-4 px-3 py-1.5 rounded-xl z-10"
          style={{ backgroundColor: status.bg }}
        >
          <Text
            className="text-white text-xs tracking-[0.5px] uppercase"
            style={{ fontFamily: "Lexend_700Bold" }}
          >
            {status.label}
          </Text>
        </View>
        <View className="absolute top-3 right-3 z-20">
          <Menu
            trigger={(triggerProps) => (
              <Pressable
                {...triggerProps}
                className="w-[38px] h-[38px] rounded-[13px] bg-[#080B12]/75 justify-center items-center gap-[3.5px] border border-white/18 flex-col"
                style={{
                  shadowColor: "#fff",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                }}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              >
                <View className="w-1 h-1 rounded-full bg-white/90" />
                <View className="w-1 h-1 rounded-full bg-white/90 opacity-70" />
                <View className="w-1 h-1 rounded-full bg-white/90" />
              </Pressable>
            )}
            placement="bottom right"
            offset={10}
            bg="#0C1018"
            borderColor="rgba(255,255,255,0.1)"
            borderWidth={1}
            rounded="2xl"
            shadow={9}
            w={240}
          >
            {/* Panel header */}
            <Box px={4} pt={3} pb={2}>
              <Text
                className="text-slate-400/50 text-[10px] tracking-[1.2px] uppercase"
                style={{ fontFamily: "Lexend_600SemiBold" }}
              >
                Quick Actions
              </Text>
            </Box>
            <Divider bg="rgba(255,255,255,0.05)" thickness="1" />

            {/* Favorite */}
            <Menu.Item onPress={() => toggleLike(item.id)} py={3} px={4}>
              <HStack alignItems="center" space={3}>
                <View
                  className={[
                    "w-9 h-9 rounded-full bg-white/6 justify-center items-center border border-white/5",
                    liked ? "bg-red-500/12 border-red-500/20" : "",
                  ].join(" ")}
                >
                  <Heart
                    size={16}
                    color={liked ? "#EF4444" : "#94A3B8"}
                    fill={liked ? "#EF4444" : "none"}
                  />
                </View>
                <VStack flex={1}>
                  <Text
                    className="text-slate-200 text-sm"
                    style={[
                      { fontFamily: "Lexend_600SemiBold" },
                      liked && { color: "#F87171" },
                    ]}
                  >
                    {liked ? t("menu.unfavorite") : t("menu.favorite")}
                  </Text>
                  <Text
                    className="text-slate-400/55 text-[11px] mt-0.5"
                    style={{ fontFamily: "Lexend_400Regular" }}
                  >
                    {liked ? "Tap to unsave" : "Save for later"}
                  </Text>
                </VStack>
              </HStack>
            </Menu.Item>

            {/* button report post */}
            <Menu.Item
              onPress={() =>
                router.push({
                  pathname: "/ReportScreen",
                  params: { targetId: item.id, targetType: "CAR" },
                })
              }
              py={3}
              px={4}
            >
              <HStack alignItems="center" space={3}>
                <View className="w-9 h-9 rounded-full bg-white/6 justify-center items-center border border-white/5">
                  <Flag size={16} color="#F87171" />
                </View>

                <VStack flex={1}>
                  <Text
                    className="text-sm"
                    style={[
                      { fontFamily: "Lexend_600SemiBold" },
                      { color: "#F87171" },
                    ]}
                  >
                    {t("menu.report")}
                  </Text>

                  <Text
                    className="text-slate-400/55 text-[11px] mt-0.5"
                    style={{ fontFamily: "Lexend_400Regular" }}
                  >
                    {t("menu.reportSub") || "Report this listing"}
                  </Text>
                </VStack>
              </HStack>
            </Menu.Item>

            {/* Owner-only section */}
            {Number(user?.id) ===
              Number(item.userId || item.user?.id || item.User?.id) && (
              <>
                <Divider bg="rgba(255,255,255,0.05)" thickness="1" my={1} />
                <Box px={4} py={2}>
                  <Text
                    className="text-red-400/50 text-[10px] tracking-wider uppercase"
                    style={{ fontFamily: "Lexend_600SemiBold" }}
                  >
                    Your Listing
                  </Text>
                </Box>
                <Menu.Item onPress={() => onDelete?.(item.id)} py={3} px={4}>
                  <HStack alignItems="center" space={3}>
                    <View className="w-9 h-9 rounded-full bg-red-500/12 justify-center items-center border border-red-500/20">
                      <Trash2 size={16} color="#F87171" />
                    </View>
                    <VStack flex={1}>
                      <Text
                        className="text-sm"
                        style={[
                          { fontFamily: "Lexend_600SemiBold" },
                          { color: "#F87171" },
                        ]}
                      >
                        {t("menu.delete")}
                      </Text>
                      <Text
                        className="text-[11px] mt-0.5"
                        style={[
                          { fontFamily: "Lexend_400Regular" },
                          { color: "rgba(248,113,113,0.5)" },
                        ]}
                      >
                        Permanently remove
                      </Text>
                    </VStack>
                  </HStack>
                </Menu.Item>
              </>
            )}
          </Menu>
        </View>

        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-2">
          {liked && (
            <View className="flex-row items-center bg-[#18181B]/85 px-3 py-1.5 rounded-full gap-1">
              <Heart size={12} color="#EF4444" fill="#EF4444" />
            </View>
          )}
        </View>
      </View>
      <View className="p-5">
        <View className="flex-row justify-between items-start">
          <View>
            <Text
              className="text-xl text-white mb-1"
              style={{ fontFamily: "Lexend_700Bold" }}
            >
              {item.title}
            </Text>
            <Text
              className="text-sm text-slate-500"
              style={{ fontFamily: "Lexend_500Medium" }}
            >
              {item.year} - {item.brand}
            </Text>
          </View>
          <Text
            className="text-xl text-white"
            style={{ fontFamily: "Lexend_800ExtraBold" }}
          >
            ${item.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CarCard(props: CarCardProps) {
  return <CarCardComponent {...props} />;
}
