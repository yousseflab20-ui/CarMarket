import React, { useCallback, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import ViewShot from "react-native-view-shot";
import { Video, ResizeMode } from "expo-av";
import {
  ArrowLeft,
  Share2,
  MapPin,
  Fuel,
  Users,
  Gauge,
  Clock,
  CheckCircle,
  Phone,
  Star,
  ChevronRight,
  Shield,
  RotateCcw,
  Headphones,
  Car as CarIcon,
  BadgeCheck,
  Edit,
  Pause,
  Play,
} from "lucide-react-native";
import { message } from "../service/chat/endpoint.message";
import * as Sharing from "expo-sharing";
import {
  createRating,
  getSellerRating,
} from "../service/rating/endpointrating";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { Car } from "../types/car";
import { User } from "../types/user";
import { SellerRatingResponse } from "../types/rating";
import {
  CarDetailParams,
  SpecCardProps,
  SellerCardProps,
  RateSellerModalProps,
  PerkChipProps,
  SectionHeaderProps,
} from "../types/screens/carDetail";
import { useStackedToastStore } from "../store/stackedToastStore";
import MapCard from "../components/CarDetailsMap";

const { width: SCREEN_W } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;

const isVideoMediaUrl = (uri?: string) =>
  !!(
    uri?.match(/\.(mp4|mov|avi|mkv|webm)(\?.*)?$/i) ||
    uri?.includes("/video/upload/")
  );

const getColors = (isDark: boolean) => ({
  bg: isDark ? "#080B12" : "#F8FAFC",
  surface: isDark ? "#0D1117" : "#F1F5F9",
  card: isDark ? "#131929" : "#FFFFFF",
  border: isDark ? "#1E2A3A" : "#E2E8F0",
  elevated: isDark ? "#182030" : "#FFFFFF",
  blue: "#3B82F6",
  blueDark: "#1D4ED8",
  blueGlow: isDark ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.12)",
  green: "#10B981",
  greenGlow: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  white: isDark ? "#F0F6FF" : "#0F172A",
  whiteTrue: "#FFFFFF",
  muted: isDark ? "#8B9CB8" : "#64748B",
  dim: isDark ? "#5A6A82" : "#94A3B8",
  faint: isDark ? "#2A3A52" : "#CBD5E1",
  textDim: isDark ? "#4A5A72" : "#64748B",
});

const getDetailMediaStyles = (C: any) => StyleSheet.create({
  frame: {
    height: IMAGE_HEIGHT,
    overflow: "hidden",
    backgroundColor: C.card,
  },
  centerControlWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerControlOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 10,
  },
  centerControlInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.78)",
  },
  pausePill: {
    position: "absolute",
    right: 18,
    bottom: 26,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8, 11, 18, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
});

export default function CarDetailScreen() {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  const { t } = useTranslation();
  const params = useLocalSearchParams<any>();
  const { user, car, user2Id } = params as unknown as CarDetailParams;

  const queryClient = useQueryClient();
  const scrollY = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<ViewShot>(null);

  const { user: currentUser } = useAuthStore();
  const user2IdNum = user2Id ? parseInt(user2Id) : undefined;
  const userObj = user ? (JSON.parse(user) as User) : null;
  const carObj = car ? (JSON.parse(car) as Car) : null;
  const isOwner = currentUser?.id === user2IdNum;
  const addToast = useStackedToastStore((state) => state.addToast);

  if (!carObj) {
    return (
      <View className="flex-1  items-center justify-center gap-3" style={{ backgroundColor: C.bg }}>
        <CarIcon size={48} color={C.dim} />
        <Text
          className=" text-[15px]" style={{ color: C.muted , fontFamily: "Lexend_400Regular"  }}
        >
          {t("carDetail.missingData")}
        </Text>
      </View>
    );
  }

  const [activeImg, setActiveImg] = useState(0);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");

  const images: string[] =
    Array.isArray(carObj.images) && carObj.images.length > 0
      ? carObj.images
      : [];

  const messageMutation = useMutation<any, Error, number>({
    mutationFn: message,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["message"] }),
  });

  const { data: sellerRating } = useQuery<SellerRatingResponse, Error>({
    queryKey: ["getSellerRating", user2IdNum],
    queryFn: () => getSellerRating(user2IdNum!),
  });

  const submitRating = useMutation({
    mutationFn: (vars: { sellerId: number; rating: number; comment: string }) =>
      createRating(vars.sellerId, vars.rating, vars.comment),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["getSellerRating", vars.sellerId],
      });
      setRateModalVisible(false);
      setUserRating(0);
      setUserComment("");
      addToast({
        title: t("carDetail.success"),
        description: t("carDetail.thankYouRating"),
        type: "success",
      });
    },
    onError: (err) => {
      addToast({
        title: t("carDetail.error"),
        description: t("carDetail.failedRating"),
        type: "error",
      });
    },
  });
  console.log("rating user", sellerRating);

  const handleShare = async () => {
    try {
      if (!viewRef.current?.capture) return;

      const uri = await viewRef.current.capture();

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share this car 🚗",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleMessage = async () => {
    if (!user2IdNum) {
      Alert.alert(t("carDetail.error"), t("carDetail.sellerInfoMissing"));
      return;
    }
    messageMutation.mutate(user2IdNum, {
      onSuccess: (data: {
        conversation: { id: any };
        id: any;
        conv: { id: any };
      }) => {
        const conversationId =
          data?.conversation?.id || data?.id || data?.conv?.id;
        if (conversationId) {
          router.push({
            pathname: "/ViewMessaageUse",
            params: {
              conversationId: conversationId.toString(),
              otherUserId: user2IdNum.toString(),
              otherUserName: userObj?.name || "Seller",
              otherUserPhoto: userObj?.photo || "",
            },
          });
        } else {
          Alert.alert(t("carDetail.error"), t("carDetail.failedConversation"));
        }
      },
      onError: (err: any) => {
        console.error("❌ Failed to open conversation:", err);
        Alert.alert(
          t("carDetail.error"),
          t("carDetail.couldNotOpenConversation"),
        );
      },
    });
  };

  const headerBg = scrollY.interpolate({
    inputRange: [IMAGE_HEIGHT - 80, IMAGE_HEIGHT - 20],
    outputRange: [isDark ? "rgba(8,11,18,0)" : "rgba(248,250,252,0)", isDark ? "rgba(8,11,18,1)" : "rgba(248,250,252,1)"],
    extrapolate: "clamp",
  });

  const statusBarHeight =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;
  const topPad = statusBarHeight + 12;

  const hasCoordinates = !!carObj.latitude && !!carObj.longitude;

  return (
    <View className="flex-1 " style={{ backgroundColor: C.bg }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        className="absolute top-0 left-0 right-0 z-[100] flex-row items-center justify-between px-4 pb-3"
        style={[{ backgroundColor: headerBg, paddingTop: topPad }]}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-black/50 border border-white/12 items-center justify-center"
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={C.white} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center  text-[15px] mx-2" style={{ color: C.white , fontFamily: "Lexend_700Bold"  }}
          numberOfLines={1}
        >
          {carObj.title}
        </Text>
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-black/50 border border-white/12 items-center justify-center"
          onPress={handleShare}
        >
          <Share2 size={18} color={C.white} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        <ViewShot ref={viewRef} options={{ format: "jpg", quality: 0.9 }}>
          <Animated.View 
            className="w-full h-[300px] relative overflow-hidden" 
            style={[
              { backgroundColor: C.card },
              {
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [-100, 0, 300],
                      outputRange: [-50, 0, 150],
                      extrapolate: 'clamp',
                    })
                  },
                  {
                    scale: scrollY.interpolate({
                      inputRange: [-100, 0],
                      outputRange: [1.3, 1],
                      extrapolateRight: 'clamp',
                    })
                  }
                ]
              }
            ]}
          >
            {images.length > 0 ? (
              <FlatList
                data={images}
                keyExtractor={(_, i) => i.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(
                    e.nativeEvent.contentOffset.x / SCREEN_W,
                  );
                  setActiveImg(idx);
                }}
                renderItem={({ item }) => (
                  <DetailMediaSlide uri={item} width={SCREEN_W} />
                )}
              />
            ) : (
              <View className="flex-1 items-center justify-center  gap-3" style={{ backgroundColor: C.card }}>
                <View className="w-[90px] h-[90px] rounded-3xl  border  items-center justify-center" style={{ borderColor: C.border , backgroundColor: C.elevated  }}>
                  <CarIcon size={52} color={C.dim} />
                </View>
                <Text
                  className=" text-[13px]" style={{ color: C.dim , fontFamily: "Lexend_400Regular"  }}
                >
                  {t("carDetail.noPhotos")}
                </Text>
              </View>
            )}

            <View
              className="absolute bottom-0 left-0 right-0 h-[120px] bg-transparent"
              pointerEvents="none"
            />
            <View
              className="absolute top-0 left-0 right-0 h-[100px] bg-transparent opacity-70"
              pointerEvents="none"
            />

            {images.length > 1 && (
              <View
                className="absolute bottom-[56px] left-0 right-0 flex-row justify-center gap-1.5"
                pointerEvents="none"
              >
                {images.map((_, i) => (
                  <View
                    key={i}
                    className={[
                      "w-[5px] h-[5px] rounded-[2.5px] bg-white/35",
                      i === activeImg ? "w-5 bg-white" : "",
                    ].join(" ")}
                  />
                ))}
              </View>
            )}

            <View className="absolute bottom-5 left-4 flex-row gap-2">
              <View className="flex-row items-center gap-1.5  border  rounded-[20px] px-3 py-1 " style={{ backgroundColor: C.greenGlow , borderColor: C.greenGlow  , backgroundColor: isDark ? "rgba(22,27,34,0.8)" : "rgba(241,245,249,0.8)"  }}>
                <CheckCircle size={11} color={C.green} />
                <Text
                  className="text-[11px]"
                  style={{ color: C.green, fontFamily: "Lexend_600SemiBold" }}
                >
                  {t("carDetail.availableNow")}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5  border border-white/15 rounded-[20px] px-3 py-1" style={{ backgroundColor: isDark ? "rgba(22,27,34,0.8)" : "rgba(241,245,249,0.8)" }}>
                <Text
                  className="text-white/90 text-[11px]"
                  style={{ fontFamily: "Lexend_600SemiBold" }}
                >
                  {t("carDetail.luxuryEdition")}
                </Text>
              </View>
            </View>
          </Animated.View>

          <View className=" rounded-t-3xl -mt-6 pb-5 border-t " style={{ borderColor: C.border , backgroundColor: C.surface  }}>
            <View
              className="w-10 h-1 rounded  align-self-center mt-3.5 mb-5.5" style={{ backgroundColor: C.faint , alignSelf: "center"  }}
            />

            <View className="px-5 mb-1">
              <Text
                className="text-[#3B82F6] text-[11px] tracking-[2.5px] uppercase mb-1.5"
                style={{ fontFamily: "Lexend_700Bold" }}
              >
                {carObj.brand ?? "Premium Brand"}
              </Text>
              <Text
                className=" text-3xl leading-8 mb-2.5" style={{ color: C.white , fontFamily: "Lexend_800ExtraBold"  }}
              >
                {carObj.title}
              </Text>
              <View className="flex-row items-center gap-2.5">
                <View className=" rounded-lg px-2.5 py-1 border " style={{ borderColor: C.border , backgroundColor: C.card  }}>
                  <Text
                    className=" text-xs" style={{ color: C.muted , fontFamily: "Lexend_600SemiBold"  }}
                  >
                    {carObj.year}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Star size={12} color={C.amber} fill={C.amber} />
                  <Text
                    className=" text-xs" style={{ color: C.muted , fontFamily: "Lexend_500Medium"  }}
                  >
                    4.8 · 127 {t("carDetail.reviews")}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2.5 px-5 mb-1 mt-4">
              <SpecCard
                icon={<Gauge size={20} color={C.amber} />}
                value={carObj.speed ?? 195}
                unit={t("carDetail.mphTop")}
                accentColor={C.amber}
              />
              <SpecCard
                icon={<Users size={20} color={C.blue} />}
                value={carObj.seats ?? 5}
                unit={t("carDetail.seats")}
                accentColor={C.blue}
              />
              <SpecCard
                icon={<Fuel size={20} color={C.green} />}
                value={(carObj.mileage ?? 0).toLocaleString()}
                unit={t("carDetail.kmRange")}
                accentColor={C.green}
              />
            </View>

            {!sellerRating?.hasRatedSeller && (
              <>
                <Divider />
                <View className="px-5 mb-1">
                  <SectionHeader
                    title={t("carDetail.listedBy")}
                    action={`${t("carDetail.viewProfile")} →`}
                  />
                  <SellerCard
                    user={userObj}
                    rating={sellerRating || null}
                    onRate={() => setRateModalVisible(true)}
                    reviews={sellerRating?.totalRatings || 0}
                  />
                </View>
              </>
            )}

            <Divider />

            <View className="px-5 mb-1">
              <SectionHeader
                title={`${t("carDetail.reviews")} (${sellerRating?.totalRatings || 0})`}
              />
              {Array.isArray(sellerRating?.ratings) &&
              sellerRating?.ratings.length > 0 ? (
                <View className="flex-col gap-3">
                  <ReviewItem review={sellerRating.ratings[0]} />
                  {sellerRating.totalRatings > 0 && (
                    <TouchableOpacity
                      className="items-center py-3 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mt-1.5"
                      onPress={() => {
                        router.push({
                          pathname: "/ReviewsScreen",
                          params: {
                            sellerId: user2IdNum,
                            sellerName: userObj?.name || "Seller",
                          },
                        });
                      }}
                    >
                      <Text
                        className="text-[#3B82F6] text-[13px]"
                        style={{ fontFamily: "Lexend_600SemiBold" }}
                      >
                        {t("carDetail.viewMoreReviews", {
                          count: sellerRating.totalRatings,
                        })}{" "}
                        →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <Text
                  className=" text-sm text-center py-2.5 italic" style={{ color: C.dim , fontFamily: "Lexend_400Regular"  }}
                >
                  {t("carDetail.noReviewsYet")}
                </Text>
              )}
            </View>

            <Divider />

            <View className="px-5 mb-1">
              <SectionHeader title={t("carDetail.rentalDetails")} />
              <View className="flex-row gap-2.5 mb-3.5">
                <View className="flex-1  border  rounded-2xl p-4 items-center gap-1.5" style={{ borderColor: C.border , backgroundColor: C.card  }}>
                  <Clock size={22} color={C.blue} />
                  <Text
                    className=" text-[10px] uppercase tracking-[0.8px]" style={{ color: C.textDim , fontFamily: "Lexend_400Regular"  }}
                  >
                    {t("carDetail.dailyRate")}
                  </Text>
                  <View className="flex-row items-baseline gap-0.5">
                    <Text
                      className=" text-2xl" style={{ color: C.white , fontFamily: "Lexend_800ExtraBold"  }}
                    >
                      ${carObj.pricePerDay}
                    </Text>
                    <Text
                      className=" text-xs" style={{ color: C.textDim , fontFamily: "Lexend_400Regular"  }}
                    >
                      {t("carDetail.perDay")}
                    </Text>
                  </View>
                </View>
                <View className="flex-1  border border-[#10B981]/25 bg-[#10B981]/5 rounded-2xl p-4 items-center gap-1.5" style={{ backgroundColor: C.card }}>
                  <CheckCircle size={22} color={C.green} />
                  <Text
                    className=" text-[10px] uppercase tracking-[0.8px]" style={{ color: C.textDim , fontFamily: "Lexend_400Regular"  }}
                  >
                    {t("carDetail.availability")}
                  </Text>
                  <Text
                    className="text-2xl"
                    style={{
                      color: C.green,
                      fontSize: 14,
                      fontFamily: "Lexend_800ExtraBold",
                    }}
                  >
                    {t("carDetail.readyNow")}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-2 flex-wrap">
                <PerkChip
                  icon={<Shield size={12} color={C.blue} />}
                  label={t("carDetail.fullInsurance")}
                  color={C.blue}
                />
                <PerkChip
                  icon={<RotateCcw size={12} color={C.muted} />}
                  label={t("carDetail.freeCancel")}
                  color={C.muted}
                />
                <PerkChip
                  icon={<Headphones size={12} color={C.muted} />}
                  label={t("carDetail.support247")}
                  color={C.muted}
                />
              </View>
            </View>

            <Divider />
            <View className="px-5 mb-1">
              <SectionHeader
                title={t("carDetail.location")}
                action={hasCoordinates ? `${t("carDetail.viewMap")} →` : undefined}
                onAction={hasCoordinates ? () => setMapModalVisible(true) : undefined}
              />
              {hasCoordinates ? (
                <MapCard
                  latitude={carObj.latitude!}
                  longitude={carObj.longitude!}
                />
              ) : (
                <TouchableOpacity
                  className="flex-row items-center  border  rounded-2xl p-3.5 gap-3" style={{ borderColor: C.border , backgroundColor: C.card  }}
                  activeOpacity={0.7}
                >
                  <View className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 items-center justify-center">
                    <MapPin size={22} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className=" text-[10px] uppercase tracking-[0.8px] mb-0.5" style={{ color: C.textDim , fontFamily: "Lexend_400Regular"  }}
                    >
                      {t("carDetail.pickupLocation")}
                    </Text>
                    <Text
                      className=" text-sm" style={{ color: C.white , fontFamily: "Lexend_600SemiBold"  }}
                    >
                      {carObj.city}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            <Divider />

            <View className="px-5 mb-1">
              <SectionHeader title={t("carDetail.aboutCar")} />
              <Text
                className=" text-sm leading-5" style={{ color: C.muted , fontFamily: "Lexend_400Regular"  }}
              >
                {carObj.description ?? t("carDetail.noDescription")}
              </Text>
            </View>

            <View style={{ height: 120 }} />
          </View>
        </ViewShot>
      </Animated.ScrollView>

      <Animated.View
        className="absolute bottom-[50px] left-0 right-0  border-t  px-5 pt-3.5" style={{ borderColor: C.border , backgroundColor: C.surface  , paddingBottom: Platform.OS === "ios" ? 30 : 18,
         }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <View>
            <Text
              className=" text-[10px] uppercase tracking-[1px] mb-0.5" style={{ color: C.textDim , fontFamily: "Lexend_400Regular"  }}
            >
              {isOwner ? t("carDetail.listedPrice") : t("carDetail.totalPrice")}
            </Text>
            <View className="flex-row items-baseline gap-0.5">
              <Text
                className=" text-[26px]" style={{ color: C.white , fontFamily: "Lexend_800ExtraBold"  }}
              >
                ${carObj.price}
              </Text>
            </View>
          </View>

          {isOwner ? (
            <View className="flex-row gap-2.5 flex-1 justify-end">
              <TouchableOpacity
                className="flex-1 flex-row h-[52px] rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6] items-center justify-center gap-2"
                onPress={() => {
                  router.push({
                    pathname: "/EditCarScreen",
                    params: { id: carObj.id },
                  });
                }}
              >
                <Edit size={18} color={C.blue} />
                <Text
                  className="text-[15px] tracking-[0.3px]"
                  style={{ color: C.blue, fontFamily: "Lexend_700Bold" }}
                >
                  {t("carDetail.manageListing")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-2.5 flex-1 justify-end">
              <TouchableOpacity
                className="w-[52px] h-[52px] rounded-2xl  border  items-center justify-center" style={{ borderColor: C.border , backgroundColor: C.card  }}
                onPress={() => {
                  router.push({
                    pathname: "/CallScreen",
                    params: {
                      callID: `car_${carObj.id}_${user2IdNum}_${Date.now()}`,
                      isVideoCall: "true",
                    },
                  });
                }}
              >
                <Phone size={22} color={C.white} />
              </TouchableOpacity>
              <TouchableOpacity
                className={[
                  "flex-1 h-[52px] rounded-2xl bg-[#3B82F6] items-center justify-center shadow-lg",
                  messageMutation.isPending ? "opacity-70" : "",
                ].join(" ")}
                onPress={handleMessage}
                disabled={messageMutation.isPending}
              >
                <Text
                  className="text-white text-[15px] tracking-[0.3px]"
                  style={{ fontFamily: "Lexend_700Bold" }}
                >
                  {messageMutation.isPending
                    ? t("carDetail.connecting")
                    : t("carDetail.contact")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      <RateSellerModal
        visible={rateModalVisible}
        onClose={() => setRateModalVisible(false)}
        sellerName={userObj?.name || "Seller"}
        userRating={userRating}
        setUserRating={setUserRating}
        userComment={userComment}
        setUserComment={setUserComment}
        onSubmit={() =>
          submitRating.mutate({
            sellerId: user2IdNum!,
            rating: userRating,
            comment: userComment,
          })
        }
        isSubmitting={submitRating.isPending}
      />
      {/* Map Full Screen Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <SafeAreaView
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              paddingHorizontal: 16,
              paddingTop: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setMapModalVisible(false)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(8,11,18,0.8)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <ArrowLeft size={20} color={C.white} />
            </TouchableOpacity>
          </SafeAreaView>
          <MapCard
            latitude={carObj.latitude!}
            longitude={carObj.longitude!}
            fullScreen
          />
        </View>
      </Modal>

    </View>
  );
}

function DetailMediaSlide({ uri, width }: { uri: string; width: number }) {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  const videoRef = useRef<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoFinished, setIsVideoFinished] = useState(false);

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

  const toggleVideoPlayback = useCallback(async () => {
    if (!videoRef.current) return;

    if (isVideoPlaying) {
      await videoRef.current.pauseAsync();
      return;
    }

    if (isVideoFinished) {
      await videoRef.current.replayAsync();
      setIsVideoFinished(false);
      return;
    }

    await videoRef.current.playAsync();
  }, [isVideoFinished, isVideoPlaying]);

  if (!isVideoMediaUrl(uri)) {
    return (
      <Image
        source={{ uri }}
        className="w-full h-[300px]"
        style={{ width }}
        resizeMode="cover"
      />
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleVideoPlayback}
      style={[getDetailMediaStyles(C).frame, { width }]}
    >
      <Video
        ref={videoRef}
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {!isVideoPlaying && (
          <View style={getDetailMediaStyles(C).centerControlWrap}>
            <View style={getDetailMediaStyles(C).centerControlOuter}>
              <View style={getDetailMediaStyles(C).centerControlInner}>
                {isVideoFinished ? (
                  <RotateCcw size={23} color="#0F172A" />
                ) : (
                  <Play size={25} color="#0F172A" fill="#0F172A" />
                )}
              </View>
            </View>
          </View>
        )}

        {isVideoPlaying && (
          <View style={getDetailMediaStyles(C).pausePill}>
            <Pause size={15} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function SpecCard({ icon, value, unit, accentColor }: SpecCardProps) {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  return (
    <View
      className="flex-1  rounded-2xl py-4 px-2 items-center gap-1.5 border-t-[2.5px] border " style={{ borderColor: C.border , backgroundColor: C.card  , borderTopColor: accentColor  }}
    >
      <View
        className="w-[38px] h-[38px] rounded-xl items-center justify-center"
        style={{ backgroundColor: accentColor + "18" }}
      >
        {icon}
      </View>
      <Text
        className=" text-lg font-bold mt-0.5" style={{ color: C.white , fontFamily: "Lexend_800ExtraBold"  }}
      >
        {value}
      </Text>
      <Text
        className=" text-[10px] uppercase tracking-[0.5px]" style={{ color: C.textDim , fontFamily: "Lexend_400Regular"  }}
      >
        {unit}
      </Text>
    </View>
  );
}

function SellerCard({ user, rating, onRate }: SellerCardProps) {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  const { t } = useTranslation();
  if (!user) return null;
  const avgRating = Number(rating?.averageRating || 0).toFixed(1);
  const totalRatings = rating?.totalRatings ?? 0;

  return (
    <View className="rounded-3xl border p-5 mb-2" style={{ backgroundColor: isDark ? "rgba(30,41,59,0.4)" : C.surface, borderColor: isDark ? "rgba(255,255,255,0.08)" : C.border }}>
      <View className="flex-row items-center gap-4">
        <View className="relative">
          {user.photo ? (
            <Image
              source={{ uri: user.photo }}
              className="w-16 h-16 rounded-2xl border-2 border-white/10"
            />
          ) : (
            <View className="w-16 h-16 rounded-2xl border-2 border-white/10 bg-[#1D4ED8] items-center justify-center">
              <Text
                className=" text-2xl" style={{ color: C.white , fontFamily: "Lexend_700Bold"  }}
              >
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </Text>
            </View>
          )}
          {user.verified && (
            <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full  items-center justify-center border-2 border-[#0D1117]" style={{ backgroundColor: C.surface }}>
              <BadgeCheck size={14} color="#fff" fill="#3B82F6" />
            </View>
          )}
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text
              className=" text-lg" style={{ color: C.white , fontFamily: "Lexend_700Bold"  }}
              numberOfLines={1}
            >
              {user.name ?? "Seller"}
            </Text>
            {user.verified && (
              <View className="flex-row items-center gap-1 bg-[#3B82F6]/10 px-2 py-0.5 rounded-lg border border-[#3B82F6]/20">
                <Shield size={10} color={C.blue} fill={C.blue + "20"} />
                <Text
                  className="text-[#3B82F6] text-[10px] uppercase"
                  style={{ fontFamily: "Lexend_600SemiBold" }}
                >
                  {t("settings.verified")}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={10}
                  color={
                    s <= Math.floor(Number(avgRating))
                      ? C.amber
                      : "rgba(255,255,255,0.1)"
                  }
                  fill={
                    s <= Math.floor(Number(avgRating)) ? C.amber : "transparent"
                  }
                />
              ))}
            </View>
            <Text
              className=" text-sm" style={{ color: C.white , fontFamily: "Lexend_700Bold"  }}
            >
              {avgRating}
            </Text>
            <Text
              className=" text-xs" style={{ color: C.muted , fontFamily: "Lexend_400Regular"  }}
            >
              ({totalRatings} {t("carDetail.reviews")})
            </Text>
          </View>
        </View>
      </View>

      <View
        className="h-[1px] my-4.5"
        style={{ marginVertical: 18, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : C.border }}
      />
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          className="flex-row items-center gap-1.5"
          onPress={() =>
            router.push({
              pathname: "/SellerProfile",
              params: {
                user: JSON.stringify(user),
              },
            })
          }
        >
          <Text
            className=" text-[13px]" style={{ color: C.muted , fontFamily: "Lexend_600SemiBold"  }}
          >
            {t("carDetail.viewProfile")}
          </Text>
          <ChevronRight size={14} color={C.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-2 bg-[#F59E0B]/10 px-4 py-2.5 rounded-2xl border border-[#F59E0B]/25"
          onPress={onRate}
        >
          <Star size={14} color={C.amber} fill={C.amber} />
          <Text
            className="text-[#F59E0B] text-[13px]"
            style={{ fontFamily: "Lexend_700Bold" }}
          >
            {t("carDetail.rateSeller", { name: "" }).replace(" ", "")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RateSellerModal({
  visible,
  onClose,
  sellerName,
  userRating,
  setUserRating,
  userComment,
  setUserComment,
  onSubmit,
  isSubmitting,
}: RateSellerModalProps) {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  const { t } = useTranslation();
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center p-6">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="bg-[#161B22] rounded-[32px] p-7 border border-white/8 shadow-2xl">
          <View className="flex-row justify-between items-center mb-7">
            <Text
              className="text-white text-2xl"
              style={{ fontFamily: "Lexend_700Bold" }}
            >
              {t("carDetail.rateSeller", { name: sellerName })}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-[#21262D] items-center justify-center border border-white/10"
            >
              <Text style={{ color: C.muted, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setUserRating(star)}
                className="p-1.5"
              >
                <Star
                  size={36}
                  color={star <= userRating ? C.amber : C.border}
                  fill={star <= userRating ? C.amber : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text
            className=" text-sm mb-3" style={{ color: C.muted , fontFamily: "Lexend_500Medium"  }}
          >
            {t("carDetail.yourExperience")}
          </Text>
          <TextInput
            className=" rounded-[20px] p-5 text-white text-[15px] border border-white/10 min-h-[120px] mb-7" style={{ backgroundColor: C.surface , textAlignVertical: "top"  }}
            placeholder={t("carDetail.writeSomething")}
            placeholderTextColor={C.dim}
            multiline
            numberOfLines={4}
            value={userComment}
            onChangeText={setUserComment}
          />
          <TouchableOpacity
            className={[
              "bg-[#3B82F6] h-[60px] rounded-[20px] items-center justify-center shadow-lg",
              !userRating || isSubmitting ? "opacity-40 bg-white/5" : "",
            ].join(" ")}
            disabled={!userRating || isSubmitting}
            onPress={onSubmit}
          >
            <Text
              className="text-white text-base"
              style={{ fontFamily: "Lexend_700Bold" }}
            >
              {isSubmitting
                ? t("carDetail.submitting")
                : t("carDetail.submitRating")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SectionHeader({ title, action, onAction }: SectionHeaderProps & { onAction?: () => void }) {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  return (
    <View className="flex-row justify-between items-center mb-3.5">
      <Text
        className=" text-base" style={{ color: C.white , fontFamily: "Lexend_700Bold", letterSpacing: 0.2  }}
      >
        {title}
      </Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text
            className="text-[#3B82F6] text-xs"
            style={{ fontFamily: "Lexend_600SemiBold" }}
          >
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PerkChip({ icon, label, color }: PerkChipProps) {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  return (
    <View
      className="flex-row items-center gap-1.5  border rounded-[20px] px-3 py-1.5" style={{ backgroundColor: C.card , borderColor: color + "30"  }}
    >
      {icon}
      <Text
        className="text-[11px]"
        style={{ color, fontFamily: "Lexend_500Medium" }}
      >
        {label}
      </Text>
    </View>
  );
}

function ReviewItem({ review }: { review: any }) {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const buyerName = review?.buyer?.name || "Client";
  const buyerPhoto = review?.buyer?.photo || defaultAvatar;

  return (
    <View className=" rounded-2xl p-4 border " style={{ borderColor: C.border , backgroundColor: C.card  }}>
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: buyerPhoto }}
          className="w-9 h-9 rounded-full mr-2.5 " style={{ backgroundColor: C.elevated }}
        />
        <View className="flex-1">
          <Text
            className=" text-sm" style={{ color: C.white , fontFamily: "Lexend_600SemiBold"  }}
          >
            {buyerName}
          </Text>
          <Text
            className=" text-[11px] mt-0.5" style={{ color: C.dim , fontFamily: "Lexend_400Regular"  }}
          >
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={12}
              color={s <= review.rating ? C.amber : "rgba(255,255,255,0.1)"}
              fill={s <= review.rating ? C.amber : "transparent"}
            />
          ))}
        </View>
      </View>
      {!!review.comment && (
        <Text
          className=" text-[13px] leading-5" style={{ color: C.muted , fontFamily: "Lexend_400Regular"  }}
        >
          {review.comment}
        </Text>
      )}
    </View>
  );
}

function Divider() {
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useDeviceColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const C = getColors(isDark);

  return <View className="h-[1px] mx-5 my-5 opacity-60" style={{ backgroundColor: C.border }} />;
}
