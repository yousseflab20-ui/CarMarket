import { useAppTheme } from '../../hooks/useAppTheme';
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
  useColorScheme,
} from "react-native";
import { useThemeStore } from "../../store/themeStore";
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
  Play,
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
import { Video, ResizeMode } from "expo-av";
import FilterModal from "../../components/filter/FilterModal";
import { useCarFilter } from "../../hooks/filter/useCarFilter";

const isVideoMediaUrl = (uri?: string) =>
  !!(
    uri?.match(/\.(mp4|mov|avi|mkv|webm)$/i) || uri?.includes("/video/upload/")
  );

const mediaStyles = StyleSheet.create({
  mediaFrame: {
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#05070C",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 7, 18, 0.16)",
  },
  videoPlayButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  videoPlayCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
});

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

  const { theme, systemTheme, isDark } = useAppTheme();


  const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
  const brandModalAnim = useRef(new Animated.Value(height)).current;

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

  const {
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
    filterModalAnim,
    closeFilterModal,
    applySearch,
    clearFilters,
  } = useCarFilter({ cars: cars as Car[] | undefined });

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


  if (isLoading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#09090B" : "#F8FAFC",
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
          backgroundColor: isDark ? "#09090B" : "#F8FAFC",
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
          backgroundColor: isDark ? "#09090B" : "#F8FAFC",
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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#09090B" : "#F8FAFC" }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#09090B" : "#F8FAFC"} />
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-5">
        <TouchableOpacity
          className="w-11 h-11 rounded-full justify-center items-center relative"
          style={{ backgroundColor: isDark ? "#18181B" : "#E2E8F0" }}
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
            className="text-lg opacity-90"
            style={{ fontFamily: "Lexend_600SemiBold", color: isDark ? "#fff" : "#0F172A" }}
          >
            {t("carScreen.searchHeader")}
          </Text>
        </View>

        <TouchableOpacity
          className="w-12 h-12 rounded-[18px] justify-center items-center"
          style={{ backgroundColor: isDark ? "#18181B" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(59,130,246,0.15)" : "#E2E8F0", borderRadius: 18 }}
          onPress={() => router.push("/NotificationsScreen")}
        >
          <View className="w-8 h-8 justify-center items-center">
            <Bell size={20} color={isDark ? "#fff" : "#1E293B"} />
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
        <View
          className="flex-row items-center h-[54px] rounded-2xl px-4 gap-3"
          style={{ backgroundColor: isDark ? "#18181B" : "#fff", borderWidth: 1, borderColor: isDark ? "transparent" : "#E2E8F0", borderRadius: 16 }}
        >
          <Search size={20} color="#94A3B8" />
          <TextInput
            placeholder={t("carScreen.searchPlaceholder")}
            placeholderTextColor="#94A3B8"
            className="flex-1 text-[15px]"
            style={{ fontFamily: "Lexend_400Regular", color: isDark ? "#fff" : "#0F172A" }}
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
          className="text-[15px] uppercase tracking-widest"
          style={{ fontFamily: "Lexend_600SemiBold", color: isDark ? "#94A3B8" : "#64748B" }}
        >
          {t("carScreen.category")}
        </Text>
        <TouchableOpacity
          onPress={() => setIsBrandModalVisible(true)}
          className="flex-row items-center px-4 py-2 rounded-full"
          style={{ backgroundColor: isDark ? "#18181B" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0" }}
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
      <FilterModal
        visible={isFilterVisible}
        onClose={closeFilterModal}
        filterModalAnim={filterModalAnim}
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        applySearch={applySearch}
        isSearching={isSearching}
      />
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
            className="rounded-t-[32px] px-6 pt-6 pb-8"
            style={{ 
              transform: [{ translateY: brandModalAnim }],
              backgroundColor: isDark ? "#161921" : "#fff" 
            }}
          >
            {/* Prevent touch propagation to the backdrop */}
            <TouchableOpacity activeOpacity={1}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 48,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: isDark ? "#3F3F46" : "#E2E8F0",
                  }}
                />
              </View>
              <Text
                className="text-xl mb-6 text-center"
                style={{ fontFamily: "Lexend_700Bold", color: isDark ? "#fff" : "#0F172A" }}
              >
                Select a Brand
              </Text>

              <View className="flex-row flex-wrap justify-between gap-y-4">
                <TouchableOpacity
                  className="w-[30%] items-center justify-center py-4 rounded-2xl border"
                  style={{
                    backgroundColor: selectedBrand === "All"
                      ? "rgba(59,130,246,0.1)"
                      : isDark ? "#18181B" : "#F8FAFC",
                    borderColor: selectedBrand === "All"
                      ? "#3B82F6"
                      : isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0",
                  }}
                  onPress={() => closeBrandModal("All")}
                >
                  <Text className="text-2xl mb-2">🌟</Text>
                  <Text
                    style={[
                      { fontFamily: "Lexend_600SemiBold", fontSize: 13 },
                      selectedBrand === "All"
                        ? { color: "#3B82F6" }
                        : { color: isDark ? "#94A3B8" : "#64748B" }
                    ]}
                  >
                    {t("carScreen.all")}
                  </Text>
                </TouchableOpacity>

                {BRANDS.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    className="w-[30%] items-center justify-center py-4 rounded-2xl border"
                    style={{
                      backgroundColor: selectedBrand === brand.name
                        ? "rgba(59,130,246,0.1)"
                        : isDark ? "#18181B" : "#F8FAFC",
                      borderColor: selectedBrand === brand.name
                        ? "#3B82F6"
                        : isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0",
                    }}
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
                      style={[
                        { fontFamily: "Lexend_600SemiBold", fontSize: 13 },
                        selectedBrand === brand.name
                          ? { color: "#3B82F6" }
                          : { color: isDark ? "#94A3B8" : "#64748B" }
                      ]}
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
  const { theme, systemTheme, isDark } = useAppTheme();
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
  const openDetails = useCallback(() => {
    router.push({
      pathname: "/CarDetailScreen",
      params: {
        car: JSON.stringify(item),
        user: JSON.stringify(item.User || item.user || null),
        user2Id: item.userId?.toString() || "",
      },
    });
  }, [item]);

  const isOwner =
    Number(user?.id) === Number(item.userId || item.user?.id || item.User?.id);

  return (
    <View
      className={[
        "rounded-[28px] mb-5 border-2 overflow-hidden",
        isSelected ? "border-blue-500" : "border-transparent",
      ].join(" ")}
      style={{
        backgroundColor: isDark ? "#18181B" : "#ffffff",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      }}
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
            <MediaSlide
              uri={img}
              cardWidth={cardWidth}
              onOpenDetails={openDetails}
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
                className="w-[38px] h-[38px] rounded-[13px] justify-center items-center gap-[3.5px] border flex-col"
                style={{
                  backgroundColor: isDark ? "rgba(8,11,18,0.75)" : "#F1F5F9",
                  borderColor: isDark ? "rgba(255,255,255,0.18)" : "#E2E8F0",
                  shadowColor: isDark ? "#fff" : "#000",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isDark ? 0.06 : 0.1,
                  shadowRadius: 6,
                }}
                android_ripple={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
              >
                <View className="w-1 h-1 rounded-full" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.9)" : "#475569" }} />
                <View className="w-1 h-1 rounded-full" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.9)" : "#475569", opacity: 0.7 }} />
                <View className="w-1 h-1 rounded-full" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.9)" : "#475569" }} />
              </Pressable>
            )}
            placement="bottom right"
            offset={10}
            bg={isDark ? "#0C1018" : "#ffffff"}
            borderColor={isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}
            borderWidth={1}
            rounded="2xl"
            shadow={9}
            w={240}
          >
            {/* Panel header */}
            <Box px={4} pt={3} pb={2}>
              <Text
                className="text-[10px] tracking-[1.2px] uppercase"
                style={{ fontFamily: "Lexend_600SemiBold", color: isDark ? "rgba(148,163,184,0.5)" : "#64748B" }}
              >
                Quick Actions
              </Text>
            </Box>
            <Divider bg={isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0"} thickness="1" />

            {/* Favorite */}
            <Menu.Item onPress={() => toggleLike(item.id)} py={3} px={4}>
              <HStack alignItems="center" space={3}>
                <View
                  className="w-9 h-9 rounded-full justify-center items-center border"
                  style={
                    liked 
                      ? { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.2)" } 
                      : { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0" }
                  }
                >
                  <Heart
                    size={16}
                    color={liked ? "#EF4444" : "#94A3B8"}
                    fill={liked ? "#EF4444" : "none"}
                  />
                </View>
                <VStack flex={1}>
                  <Text
                    className="text-sm"
                    style={[
                      { fontFamily: "Lexend_600SemiBold" },
                      { color: liked ? "#F87171" : (isDark ? "#E2E8F0" : "#0F172A") },
                    ]}
                  >
                    {liked ? t("menu.unfavorite") : t("menu.favorite")}
                  </Text>
                  <Text
                    className="text-[11px] mt-0.5"
                    style={{ fontFamily: "Lexend_400Regular", color: isDark ? "rgba(148,163,184,0.55)" : "#64748B" }}
                  >
                    {liked ? "Tap to unsave" : "Save for later"}
                  </Text>
                </VStack>
              </HStack>
            </Menu.Item>

            {/* button report post (hide for owner) */}
            {!isOwner && (
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
                  <View 
                    className="w-9 h-9 rounded-full justify-center items-center border"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0" }}
                  >
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
                      className="text-[11px] mt-0.5"
                      style={{ fontFamily: "Lexend_400Regular", color: isDark ? "rgba(148,163,184,0.55)" : "#64748B" }}
                    >
                      {t("menu.reportSub") || "Report this listing"}
                    </Text>
                  </VStack>
                </HStack>
              </Menu.Item>
            )}

            {/* Owner-only section */}
            {isOwner && (
              <>
                <Divider bg={isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0"} thickness="1" my={1} />
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
            <View 
              className="flex-row items-center px-3 py-1.5 rounded-full gap-1"
              style={{ backgroundColor: isDark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.9)" }}
            >
              <Heart size={12} color="#EF4444" fill="#EF4444" />
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        className="p-5"
        activeOpacity={0.85}
        onPress={openDetails}
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text
              className="text-xl mb-1"
              style={{ fontFamily: "Lexend_700Bold", color: isDark ? "#ffffff" : "#0F172A" }}
            >
              {item.title}
            </Text>
            <Text
              className="text-sm"
              style={{ fontFamily: "Lexend_500Medium", color: isDark ? "#94A3B8" : "#64748B" }}
            >
              {item.year} - {item.brand}
            </Text>
          </View>
          <Text
            className="text-xl"
            style={{ fontFamily: "Lexend_800ExtraBold", color: isDark ? "#ffffff" : "#0F172A" }}
          >
            ${item.price}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function MediaSlide({
  uri,
  cardWidth,
  onOpenDetails,
}: {
  uri: string;
  cardWidth: number;
  onOpenDetails: () => void;
}) {
  const videoRef = useRef<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // thumbnail → video switch

  // Cloudinary: replace extension with .jpg to get auto-generated thumbnail
  const getPosterUrl = (videoUrl: string) => {
    if (videoUrl.includes("/video/upload/")) {
      return videoUrl.replace(/\.(mp4|mov|webm|mkv)$/i, ".jpg");
    }
    return undefined;
  };

  const handlePlaybackStatusUpdate = useCallback((status: any) => {
    if (!status?.isLoaded) return;

    if (status.didJustFinish) {
      setIsVideoPlaying(false);
      setIsVideoFinished(true);
      return;
    }

    if (status.isPlaying) {
      setIsVideoFinished(false);
    }

    setIsVideoPlaying((current) =>
      current === status.isPlaying ? current : status.isPlaying,
    );
  }, []);

  const toggleVideoPlayback = useCallback(() => {
    if (!hasStarted) {
      // First tap: mount video + play
      setHasStarted(true);
      setIsVideoPlaying(true);
      return;
    }

    if (!videoRef.current) return;

    if (isVideoPlaying) {
      setIsVideoPlaying(false);
      videoRef.current.pauseAsync();
      return;
    }

    if (isVideoFinished) {
      setIsVideoPlaying(true);
      setIsVideoFinished(false);
      videoRef.current.replayAsync();
      return;
    }

    setIsVideoPlaying(true);
    videoRef.current.playAsync();
  }, [hasStarted, isVideoFinished, isVideoPlaying]);

  if (!isVideoMediaUrl(uri)) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onOpenDetails}
        style={{ width: cardWidth, height: "100%" }}
      >
        <Image
          source={{ uri }}
          className="h-full rounded-xl"
          style={{ width: cardWidth }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  const posterUrl = getPosterUrl(uri);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleVideoPlayback}
      style={[mediaStyles.mediaFrame, { width: cardWidth }]}
    >
      {/* Thumbnail shown instantly before user taps play */}
      {!hasStarted && posterUrl && (
        <Image
          source={{ uri: posterUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}

      {/* Video only mounted after first tap */}
      {hasStarted && (
        <Video
          ref={videoRef}
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          progressUpdateIntervalMillis={500}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      )}

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View style={mediaStyles.videoOverlay} />

        {!isVideoPlaying && (
          <View className="flex-1 items-center justify-center">
            <View style={mediaStyles.videoPlayButton}>
              <View style={mediaStyles.videoPlayCore}>
                <Play size={24} color="#0F172A" fill="#0F172A" />
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function CarCard(props: CarCardProps) {
  return <CarCardComponent {...props} />;
}
