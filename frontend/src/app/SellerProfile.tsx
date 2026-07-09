import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Mail,
  Hash,
  Shield,
  Star,
  MessageCircle,
  ChevronRight,
  BadgeCheck,
  Flag,
  Ban,
  Check,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useSellerProfileQuery,
  useSellerRatingQuery,
} from "../service/sellerProfile/queries.sellerProfile";
import { useCreateConversationMutation } from "../service/sellerProfile/mutations.sellerProfile";
import { useBlockMutation } from "../service/bloc/mutation.blocking";
import { useAppTheme } from "../hooks/useAppTheme";

const { width } = Dimensions.get("window");

export default function SellerProfile() {
  const { t } = useTranslation();
  const { userId, user } = useLocalSearchParams<any>();
  let userIdNum = userId ? Number(userId) : undefined;
  if (!userIdNum && user) {
    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser?.id) userIdNum = Number(parsedUser.id);
    } catch (e) {}
  }
  const { isDark } = useAppTheme();
  console.log(
    "🚀 ~ file: SellerProfile.tsx:30 ~ SellerProfile ~ userIdNum:",
    userId,
  );
  const C = {
    bg: isDark ? "#09090B" : "#F8FAFC",
    surface: isDark ? "#18181B" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
    white: isDark ? "#FFFFFF" : "#0F172A",
    whitePure: "#FFFFFF",
    muted: isDark ? "#64748B" : "#64748B",
    textDim: isDark ? "#94A3B8" : "#475569",
    iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    blue: "#3B82F6",
    modalBg: isDark ? "#1E293B" : "#FFFFFF",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)",
  };

  const { data: userObj, isLoading: isUserLoading } =
    useSellerProfileQuery(userIdNum);
  const { data: ratingData } = useSellerRatingQuery(userIdNum);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  const { mutate: blockUser, isPending } = useBlockMutation();

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [reportAlso, setReportAlso] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const messageMutation = useCreateConversationMutation();

  const handleContact = () => {
    if (!userIdNum) {
      Alert.alert(t("seller.error"), t("carDetail.sellerInfoMissing"));
      return;
    }

    messageMutation.mutate(userIdNum, {
      onSuccess: (data: any) => {
        const conversationId =
          data?.conversation?.id || data?.id || data?.conv?.id;
        if (conversationId) {
          router.push({
            pathname: "/ViewMessaageUse",
            params: {
              conversationId: conversationId.toString(),
              otherUserId: userIdNum.toString(),
              otherUserName: userObj?.name || t("seller.unknownSeller"),
              otherUserPhoto: userObj?.photo || "",
            },
          });
        } else {
          Alert.alert(t("seller.error"), t("carDetail.failedConversation"));
        }
      },
      onError: (err: any) => {
        console.error("❌ Failed to open conversation:", err);
        Alert.alert(t("seller.error"), t("carDetail.couldNotOpenConversation"));
      },
    });
  };

  const handleBlock = () => {
    setShowBlockModal(true);
  };

  const confirmBlock = () => {
    if (!userIdNum) return;

    blockUser(userIdNum, {
      onSuccess: () => {
        setShowBlockModal(false);
        if (reportAlso) {
          router.push({
            pathname: "/ReportScreen",
            params: { targetId: userIdNum.toString(), targetType: "USER" },
          });
        } else {
          router.back();
        }
      },
      onError: (err: any) => {
        console.error("❌ Failed to block user:", err);
        Alert.alert(
          t("seller.error", "Error"),
          t("seller.blockError", "Could not block user"),
        );
        setShowBlockModal(false);
      },
    });
  };

  if (isUserLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );
  }

  if (!userObj) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: C.bg,
        }}
      >
        <Text
          style={{
            color: C.white,
            fontSize: 16,
            fontFamily: "Lexend_500Medium",
          }}
        >
          {t("seller.dataMissing")}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: C.iconBg,
            borderColor: C.border,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={20} color={C.white} />
        </TouchableOpacity>
        <Text
          style={{
            color: C.white,
            fontSize: 20,
            letterSpacing: 0.5,
            fontFamily: "Lexend_700Bold",
          }}
        >
          {t("seller.profile")}
        </Text>
        <TouchableOpacity
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.25)",
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() =>
            router.push({
              pathname: "/ReportScreen",
              params: { targetId: userIdNum?.toString(), targetType: "USER" },
            })
          }
          activeOpacity={0.7}
        >
          <Flag size={17} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <Animated.View
          style={{
            alignItems: "center",
            marginBottom: 24,
            opacity: fadeAnim,
            transform: [{ scale: avatarScale }],
          }}
        >
          <View
            style={[
              {
                width: 144,
                height: 144,
                borderRadius: 72,
                padding: 4,
                backgroundColor: userObj.verified ? C.blue : "transparent",
              },
              userObj.verified
                ? {
                    shadowColor: C.blue,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 24,
                    elevation: 12,
                  }
                : undefined,
            ]}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 72,
                overflow: "hidden",
                backgroundColor: C.surface,
                borderWidth: 3,
                borderColor: C.bg,
              }}
            >
              {userObj.photo ? (
                <Image
                  source={{ uri: userObj.photo }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: C.iconBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: C.white,
                      fontSize: 48,
                      fontFamily: "Lexend_700Bold",
                    }}
                  >
                    {(userObj.name?.[0] || "?").toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {userObj.verified && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                right: width / 2 - 84,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: C.bg,
                borderWidth: 2,
                borderColor: C.blue,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: C.blue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <BadgeCheck size={16} color={C.blue} fill={C.bg} />
            </View>
          )}
        </Animated.View>

        <Animated.View
          style={{
            alignItems: "center",
            marginBottom: 28,
            paddingHorizontal: 20,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                color: C.white,
                letterSpacing: 0.5,
                fontFamily: "Lexend_800ExtraBold",
              }}
            >
              {userObj.name || t("seller.unknownSeller")}
            </Text>
            {userObj.verified && (
              <View
                style={{
                  width: 24,
                  height: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <BadgeCheck
                  size={22}
                  color={C.blue}
                  fill={C.blue}
                  fillOpacity={0.1}
                />
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
            }}
          >
            <Mail size={13} color={C.muted} />
            <Text
              style={{
                fontSize: 14,
                color: C.muted,
                fontFamily: "Lexend_400Regular",
              }}
            >
              {userObj.email}
            </Text>
          </View>
          {userObj.verified && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(59, 130, 246, 0.2)",
              }}
            >
              <Shield size={13} color="#22C55E" />
              <Text
                style={{
                  color: "#22C55E",
                  fontSize: 13,
                  fontFamily: "Lexend_600SemiBold",
                }}
              >
                {t("seller.verifiedSeller")}
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            gap: 10,
            marginBottom: 20,
            opacity: fadeAnim,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: C.surface,
              borderRadius: 20,
              padding: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: "rgba(245, 158, 11, 0.12)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
            </View>
            <Text
              style={{
                fontSize: 14,
                color: C.white,
                marginBottom: 4,
                fontFamily: "Lexend_700Bold",
              }}
            >
              {Number(ratingData?.averageRating || 0).toFixed(1)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: C.muted,
                letterSpacing: 0.5,
                fontFamily: "Lexend_400Regular",
              }}
            >
              {ratingData?.totalRatings ?? 0} {t("seller.reviews")}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: C.surface,
              borderRadius: 20,
              padding: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Hash size={16} color="#8B5CF6" />
            </View>
            <Text
              style={{
                fontSize: 14,
                color: C.white,
                marginBottom: 4,
                fontFamily: "Lexend_700Bold",
              }}
            >
              {userIdNum}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: C.muted,
                letterSpacing: 0.5,
                fontFamily: "Lexend_400Regular",
              }}
            >
              {t("seller.userId")}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: C.surface,
              borderRadius: 20,
              padding: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#22C55E",
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                marginBottom: 4,
                color: "#22C55E",
                fontFamily: "Lexend_700Bold",
              }}
            >
              {t("seller.online")}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: C.muted,
                letterSpacing: 0.5,
                fontFamily: "Lexend_400Regular",
              }}
            >
              {t("seller.status")}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            marginHorizontal: 20,
            backgroundColor: C.surface,
            borderRadius: 24,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: C.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: C.muted,
              marginBottom: 18,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: "Lexend_700Bold",
            }}
          >
            {t("seller.information")}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                }}
              >
                <Mail size={14} color={C.blue} />
              </View>
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 14,
                  fontFamily: "Lexend_500Medium",
                }}
              >
                {t("seller.contactEmail")}
              </Text>
            </View>
            <Text
              style={{
                color: C.white,
                fontSize: 13,
                flex: 1,
                textAlign: "right",
                marginLeft: 16,
                fontFamily: "Lexend_600SemiBold",
              }}
              numberOfLines={1}
            >
              {userObj.email}
            </Text>
          </View>

          <View
            style={{ height: 1, backgroundColor: C.border, marginLeft: 44 }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: userObj.verified
                    ? "rgba(34, 197, 94, 0.1)"
                    : isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0,0,0,0.05)",
                }}
              >
                <Shield
                  size={14}
                  color={userObj.verified ? "#22C55E" : C.muted}
                />
              </View>
              <Text
                style={{
                  color: C.textDim,
                  fontSize: 14,
                  fontFamily: "Lexend_500Medium",
                }}
              >
                {t("seller.trustStatus")}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                borderWidth: 1,
                backgroundColor: userObj.verified
                  ? "rgba(34, 197, 94, 0.1)"
                  : isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0,0,0,0.05)",
                borderColor: userObj.verified
                  ? "rgba(34, 197, 94, 0.25)"
                  : isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0,0,0,0.1)",
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: userObj.verified ? "#22C55E" : C.muted,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Lexend_600SemiBold",
                  color: userObj.verified ? "#22C55E" : C.muted,
                }}
              >
                {userObj.verified
                  ? t("seller.verifiedDocumented")
                  : t("seller.unverified")}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{ paddingHorizontal: 20, gap: 10, opacity: fadeAnim }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 15,
              paddingHorizontal: 18,
              borderRadius: 20,
              backgroundColor: "#2563EB",
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 5,
              opacity: messageMutation.isPending ? 0.7 : 1,
            }}
            onPress={handleContact}
            disabled={messageMutation.isPending}
            activeOpacity={0.8}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                {messageMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MessageCircle size={18} color="#fff" />
                )}
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontFamily: "Lexend_700Bold",
                }}
              >
                {messageMutation.isPending
                  ? t("seller.connecting")
                  : `${t("seller.contactPlaceholder")} ${userObj.name?.split(" ")[0] || t("seller.profile")}`}
              </Text>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 15,
              paddingHorizontal: 18,
              borderRadius: 20,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.3)",
              marginTop: 4,
              opacity: isPending ? 0.7 : 1,
            }}
            onPress={handleBlock}
            disabled={isPending}
            activeOpacity={0.8}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                }}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ban size={18} color="#EF4444" />
                )}
              </View>
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 16,
                  fontFamily: "Lexend_700Bold",
                }}
              >
                {isPending
                  ? t("seller.blocking", "Blocking...")
                  : t("seller.blockUser", "Block User")}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Block Modal */}
      <Modal
        visible={showBlockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBlockModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: C.modalOverlay,
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 340,
              backgroundColor: C.modalBg,
              borderRadius: 28,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            <View
              style={{ alignItems: "center", marginBottom: 20, marginTop: 8 }}
            >
              <Ban size={28} color={C.muted} />
            </View>

            <Text
              style={{
                color: C.white,
                fontSize: 22,
                textAlign: "center",
                marginBottom: 12,
                fontFamily: "Lexend_600SemiBold",
              }}
            >
              {t(
                "seller.blockTitle",
                `Block ${userObj.name?.split(" ")[0] || "User"}?`,
              )}
            </Text>

            <Text
              style={{
                color: C.textDim,
                fontSize: 15,
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 24,
                fontFamily: "Lexend_400Regular",
              }}
            >
              {t(
                "seller.blockDesc",
                "This user won't be able to message you or see your listings. They won't know you blocked or reported them.",
              )}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setReportAlso(!reportAlso)}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 32,
                gap: 16,
                paddingHorizontal: 4,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                  backgroundColor: reportAlso ? C.blue : "transparent",
                  borderColor: reportAlso ? C.blue : C.muted,
                }}
              >
                {reportAlso && <Check size={16} color="#fff" strokeWidth={3} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: C.white,
                    fontSize: 16,
                    marginBottom: 6,
                    fontFamily: "Lexend_500Medium",
                  }}
                >
                  {t("seller.reportAdmin", "Report to Admin")}
                </Text>
                <Text
                  style={{
                    color: C.muted,
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: "Lexend_400Regular",
                  }}
                >
                  {t(
                    "seller.reportDesc",
                    "Forward this user's profile to the administration for review.",
                  )}
                </Text>
              </View>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 28,
                marginTop: 8,
                marginBottom: 8,
                paddingRight: 8,
              }}
            >
              <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                <Text
                  style={{
                    color: C.blue,
                    fontSize: 16,
                    fontFamily: "Lexend_600SemiBold",
                  }}
                >
                  {t("common.cancel", "Cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmBlock} disabled={isPending}>
                <Text
                  style={{
                    color: "#EF4444",
                    fontSize: 16,
                    fontFamily: "Lexend_600SemiBold",
                    opacity: isPending ? 0.5 : 1,
                  }}
                >
                  {isPending
                    ? t("seller.blocking", "Blocking...")
                    : t("seller.block", "Block")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
