import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useAppTheme } from "../hooks/useAppTheme";
import {
  ArrowLeft,
  Handshake,
  ChevronRight,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react-native";
import {
  useBuyerNegotiationsQuery,
  useSellerNegotiationsQuery,
} from "../service/negotiation/queries";
import { useTranslation } from "react-i18next";
import SocketService from "../service/SocketService";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type TabType = "BUYING" | "SELLING";

type Offer = {
  id: number | string;
  amount: number | string;
  status?: string;
  type?: string;
  createdAt?: string;
};

type Negotiation = {
  id: number | string;
  status?: string;
  updatedAt?: string;

  Car?: {
    id?: number | string;
    title?: string;
    images?: string[];
  };

  seller?: {
    id?: number | string;
    name?: string;
    photo?: string;
  };

  buyer?: {
    id?: number | string;
    name?: string;
    photo?: string;
  };

  Offers?: Offer[];
};

const FALLBACK_CAR_IMAGE = "https://via.placeholder.com/300x200.png?text=Car";
const FALLBACK_USER_IMAGE = "https://via.placeholder.com/100.png?text=User";

const ACCENT = "#4F46E5";

// ---- Design tokens -------------------------------------------------------

function getColors(isDark: boolean) {
  return {
    bg: isDark ? "#09090B" : "#F8FAFC",
    headerBg: isDark ? "#09090B" : "#F8FAFC",
    surface: isDark ? "#18181B" : "#FFFFFF",
    surfaceMuted: isDark ? "#1F1F23" : "#F1F5F9",
    tabTrack: isDark ? "#18181B" : "#E9EEF5",
    tabActive: isDark ? "#27272A" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.06)" : "#E7ECF2",
    textPrimary: isDark ? "#FAFAFA" : "#0F172A",
    textSecondary: isDark ? "#A1A1AA" : "#64748B",
    textMuted: isDark ? "#71717A" : "#94A3B8",
    skeleton: isDark ? "#232327" : "#EAEEF3",
    accent: ACCENT,
    accentSoft: isDark ? "rgba(79,70,229,0.16)" : "#EEF0FE",
  };
}

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString).getTime();
  if (Number.isNaN(date)) return "";

  const diff = Date.now() - date;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;

  const days = Math.floor(diff / day);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function MyNegotiations() {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const colors = useMemo(() => getColors(isDark), [isDark]);

  const [activeTab, setActiveTab] = useState<TabType>("BUYING");
  const [tabsWidth, setTabsWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;

  const {
    data: buyerData,
    isLoading: loadingBuyer,
    isFetching: fetchingBuyer,
    refetch: refetchBuyer,
  } = useBuyerNegotiationsQuery();

  const {
    data: sellerData,
    isLoading: loadingSeller,
    isFetching: fetchingSeller,
    refetch: refetchSeller,
  } = useSellerNegotiationsQuery();

  // ---- Real-time: refresh list when any negotiation-related notification arrives
  useEffect(() => {
    const socket = SocketService.getInstance().getSocket();

    const handleNotification = (payload: any) => {
      const type = payload?.data?.type;
      const isNegotiationEvent = [
        "NEW_OFFER",          // buyer sent offer → seller sees it
        "OFFER_ACCEPTED",     // seller accepted offer → buyer sees it
        "OFFER_AUTO_REJECTED",// auto-rejected (below min price) → buyer sees it
        "OFFER_REJECTED",     // seller manually rejected → buyer sees it
        "SELLER_COUNTER",     // seller made counter → buyer sees it
        "COUNTER_ACCEPTED",   // buyer accepted counter → seller sees it
        "COUNTER_REJECTED",   // buyer rejected counter → seller sees it
      ].includes(type);

      if (isNegotiationEvent) {
        refetchBuyer();
        refetchSeller();
      }
    };

    socket.on("new_notification", handleNotification);
    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, [refetchBuyer, refetchSeller]);

  const negotiations = useMemo<Negotiation[]>(
    () =>
      activeTab === "BUYING"
        ? (buyerData?.negotiations ?? [])
        : (sellerData?.negotiations ?? []),
    [activeTab, buyerData, sellerData],
  );

  const isLoading = activeTab === "BUYING" ? loadingBuyer : loadingSeller;
  const isFetching = activeTab === "BUYING" ? fetchingBuyer : fetchingSeller;

  // Responsive values
  const isSmallDevice = width < 360;
  const horizontalPadding = isSmallDevice ? 14 : 20;
  const cardPadding = isSmallDevice ? 12 : 14;
  const imageSize = isSmallDevice ? 60 : 68;

  // Animate the sliding tab indicator
  useEffect(() => {
    if (!tabsWidth) return;
    const indicatorWidth = (tabsWidth - 8) / 2;
    Animated.spring(indicatorX, {
      toValue: activeTab === "BUYING" ? 4 : 4 + indicatorWidth,
      useNativeDriver: true,
      friction: 9,
      tension: 90,
    }).start();
  }, [activeTab, tabsWidth]);

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "ACCEPTED":
        return {
          label: t("negotiations.status.accepted", "Accepted"),
          color: "#10B981",
          background: isDark ? "rgba(16,185,129,0.14)" : "#ECFDF5",
          icon: CheckCircle2,
        };

      case "REJECTED":
        return {
          label: t("negotiations.status.rejected", "Rejected"),
          color: "#EF4444",
          background: isDark ? "rgba(239,68,68,0.14)" : "#FEF2F2",
          icon: XCircle,
        };

      case "COUNTERED":
        return {
          label: t("negotiations.status.countered", "Counter offer"),
          color: "#8B5CF6",
          background: isDark ? "rgba(139,92,246,0.14)" : "#F5F3FF",
          icon: RotateCcw,
        };

      // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      case "EXPIRED":
        return {
          label: t("negotiations.status.expired", "Expired"),
          color: "#71717A",
          background: isDark ? "rgba(113,113,122,0.16)" : "#F1F5F9",
          icon: Clock3,
        };

      case "CANCELLED":
        return {
          label: t("negotiations.status.cancelled", "Cancelled"),
          color: "#71717A",
          background: isDark ? "rgba(113,113,122,0.16)" : "#F1F5F9",
          icon: XCircle,
        };
      // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

      default:
        return {
          label: t("negotiations.status.pending", "Waiting"),
          color: "#F59E0B",
          background: isDark ? "rgba(245,158,11,0.14)" : "#FFFBEB",
          icon: Clock3,
        };
    }
  };
  // ---- Header -------------------------------------------------------

  const renderHeader = () => {
    const indicatorWidth = tabsWidth ? (tabsWidth - 8) / 2 : 0;

    return (
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 0,
            paddingTop: 4,
            paddingBottom: 16,
            backgroundColor: colors.headerBg,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back", "Go back")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              marginRight: 12,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Lexend_700Bold",
                fontSize: isSmallDevice ? 19 : 22,
                color: colors.textPrimary,
                letterSpacing: -0.3,
              }}
            >
              {t("negotiations.title", "My Negotiations")}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                marginTop: 2,
                fontFamily: "Lexend_400Regular",
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              {t(
                "negotiations.subtitle",
                "Track your buying and selling activity",
              )}
            </Text>
          </View>

          {isFetching && !isLoading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : null}
        </View>

        {/* Segmented tabs */}
        <View
          onLayout={(e) => setTabsWidth(e.nativeEvent.layout.width)}
          style={{
            flexDirection: "row",
            marginHorizontal: 0,
            padding: 4,
            borderRadius: 14,
            backgroundColor: colors.tabTrack,
          }}
        >
          {tabsWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 4,
                bottom: 4,
                left: 0,
                width: indicatorWidth,
                borderRadius: 11,
                backgroundColor: colors.tabActive,
                transform: [{ translateX: indicatorX }],
                shadowColor: "#000",
                shadowOpacity: isDark ? 0 : 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: isDark ? 0 : 2,
              }}
            />
          )}

          {[
            {
              key: "BUYING" as TabType,
              label: t("negotiations.tabs.buying", "Buying"),
              count: buyerData?.negotiations?.length ?? 0,
            },
            {
              key: "SELLING" as TabType,
              label: t("negotiations.tabs.selling", "Selling"),
              count: sellerData?.negotiations?.length ?? 0,
            },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  minHeight: 40,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  zIndex: 1,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Lexend_600SemiBold",
                    fontSize: 13,
                    color: active ? colors.accent : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </Text>
                <View
                  style={{
                    minWidth: 20,
                    height: 20,
                    paddingHorizontal: 5,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: active ? colors.accentSoft : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Lexend_600SemiBold",
                      fontSize: 11,
                      color: active ? colors.accent : colors.textMuted,
                    }}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ---- Empty state -------------------------------------------------------

  const renderEmptyState = () => {
    if (isLoading) return null;

    return (
      <View
        style={{
          flex: 1,
          minHeight: 420,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            backgroundColor: colors.accentSoft,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surface,
            }}
          >
            <Handshake size={32} color={colors.accent} />
          </View>
        </View>

        <Text
          style={{
            fontFamily: "Lexend_600SemiBold",
            fontSize: 17,
            color: colors.textPrimary,
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          {t("negotiations.empty.title", "No negotiations yet")}
        </Text>

        <Text
          style={{
            maxWidth: 280,
            fontFamily: "Lexend_400Regular",
            fontSize: 13,
            lineHeight: 20,
            color: colors.textMuted,
            textAlign: "center",
            marginBottom: 22,
          }}
        >
          {activeTab === "BUYING"
            ? t(
                "negotiations.empty.buying",
                "Cars you make an offer on will show up here.",
              )
            : t(
                "negotiations.empty.selling",
                "Offers you receive from buyers will show up here.",
              )}
        </Text>

        {activeTab === "BUYING" && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/")}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: colors.accent,
            }}
          >
            <Text
              style={{
                fontFamily: "Lexend_600SemiBold",
                fontSize: 13,
                color: "#FFFFFF",
              }}
            >
              {t("negotiations.empty.cta", "Browse listings")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ---- Skeleton loading state --------------------------------------------

  const SkeletonBlock = ({
    width: w,
    height: h,
    radius = 8,
    style,
  }: {
    width: number | string;
    height: number;
    radius?: number;
    style?: any;
  }) => {
    const pulse = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }, []);

    return (
      <Animated.View
        style={[
          {
            width: w,
            height: h,
            borderRadius: radius,
            backgroundColor: colors.skeleton,
            opacity: pulse,
          },
          style,
        ]}
      />
    );
  };

  const SkeletonCard = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: cardPadding,
        marginBottom: 12,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <SkeletonBlock width={imageSize} height={imageSize} radius={16} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonBlock width="70%" height={14} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="45%" height={11} style={{ marginBottom: 12 }} />
        <SkeletonBlock width="55%" height={16} />
      </View>
    </View>
  );

  // ---- List item -------------------------------------------------------

  const renderItem = ({ item }: { item: Negotiation }) => {
    const car = item.Car;
    const otherUser = activeTab === "BUYING" ? item.seller : item.buyer;
    const latestOffer = item.Offers?.[0];
    const status = getStatusConfig(item.status);
    const StatusIcon = status.icon;
    const latestAmount = latestOffer ? Number(latestOffer.amount) : null;
    const when = timeAgo(latestOffer?.createdAt ?? item.updatedAt);

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/NegotiationRoom",
            params: { negotiationId: String(item.id) },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`${car?.title || "Car"}, ${
          latestAmount !== null ? `${latestAmount} DH, ` : ""
        }${status.label}`}
        style={({ pressed }) => ({
          marginBottom: 12,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          opacity: pressed ? 0.92 : 1,
        })}
      >
        <View
          style={{
            borderRadius: 20,
            shadowColor: "#000",
            shadowOpacity: isDark ? 0 : 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: isDark ? 0 : 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "stretch",
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Status accent bar */}
            <View style={{ width: 4, backgroundColor: status.color }} />

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                padding: cardPadding,
              }}
            >
              <Image
                source={{ uri: car?.images?.[0] || FALLBACK_CAR_IMAGE }}
                resizeMode="cover"
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceMuted,
                }}
              />

              <View style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      flex: 1,
                      fontFamily: "Lexend_600SemiBold",
                      fontSize: isSmallDevice ? 14 : 15,
                      color: colors.textPrimary,
                      marginRight: 8,
                    }}
                  >
                    {car?.title || "Car"}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: status.background,
                    }}
                  >
                    <StatusIcon size={11} color={status.color} />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: "Lexend_600SemiBold",
                        fontSize: 10,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{ uri: otherUser?.photo || FALLBACK_USER_IMAGE }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      marginRight: 6,
                      backgroundColor: colors.surfaceMuted,
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      flexShrink: 1,
                      fontFamily: "Lexend_400Regular",
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    {otherUser?.name || "User"}
                  </Text>
                  {when ? (
                    <>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textMuted,
                          marginHorizontal: 5,
                        }}
                      >
                        •
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: "Lexend_400Regular",
                          fontSize: 12,
                          color: colors.textMuted,
                        }}
                      >
                        {when}
                      </Text>
                    </>
                  ) : null}
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text
                    style={{
                      fontFamily: "Lexend_500Medium",
                      fontSize: 10,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: colors.textMuted,
                      marginBottom: 2,
                    }}
                  >
                    {activeTab === "BUYING"
                      ? t("negotiations.yourOffer", "Your offer")
                      : t("negotiations.latestOffer", "Latest offer")}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "Lexend_700Bold",
                      fontSize: isSmallDevice ? 15 : 16,
                      color: colors.textPrimary,
                    }}
                  >
                    {latestAmount !== null
                      ? `${latestAmount.toLocaleString()} DH`
                      : t("negotiations.noOffers", "No offers yet")}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.surfaceMuted,
                  marginLeft: 6,
                }}
              >
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // ---- Render -------------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.bg}
        />
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: 8,
          }}
        >
          {renderHeader()}
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bg}
      />
      <FlatList
        data={negotiations}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 8,
          paddingBottom: insets.bottom + 24,
          flexGrow: negotiations.length === 0 ? 1 : 0,
        }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}
