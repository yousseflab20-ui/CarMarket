import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppTheme } from "../hooks/useAppTheme";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  RotateCcw,
  MessageCircle,
  PartyPopper,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  ShoppingBag,
} from "lucide-react-native";
import { useNegotiationByIdQuery } from "../service/negotiation/queries";
import {
  useCreateOfferMutation,
  useRespondToOfferMutation,
  useCounterResponseMutation,
} from "../service/negotiation/mutations";
import { useMarkCarAsSoldMutation } from "../service/car/mutations";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  message as createOrGetConversation,
  createConversation as sendChatMessage,
} from "../service/chat/endpoint.message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SocketService from "../service/SocketService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfferStatus, Offer, NegotiationStatus, Negotiation } from '../types/screens/negotiationRoom';

// ---- Constants ---------------------------------------------------------------

const FALLBACK_CAR_IMAGE = "https://via.placeholder.com/300x200.png?text=Car";
const FALLBACK_USER_IMAGE = "https://via.placeholder.com/100.png?text=User";
const ACCENT = "#3B82F6";

function getColors(isDark: boolean) {
  return {
    bg: isDark ? "#09090B" : "#F8FAFC",
    surface: isDark ? "#18181B" : "#FFFFFF",
    surfaceMuted: isDark ? "#1F1F23" : "#F1F5F9",
    border: isDark ? "rgba(255,255,255,0.07)" : "#E7ECF2",
    textPrimary: isDark ? "#FAFAFA" : "#0F172A",
    textSecondary: isDark ? "#A1A1AA" : "#64748B",
    textMuted: isDark ? "#71717A" : "#94A3B8",
    skeleton: isDark ? "#232327" : "#EAEEF3",
    accent: ACCENT,
    accentSoft: isDark ? "rgba(59,130,246,0.16)" : "#EFF6FF",
    line: isDark ? "#27272A" : "#E2E8F0",
  };
}

function money(amount: number | string) {
  return `${Number(amount).toLocaleString()} DH`;
}

function eventTime(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function NegotiationRoom() {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { negotiationId } = useLocalSearchParams<{ negotiationId: string }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const colors = useMemo(() => getColors(isDark), [isDark]);
  const isSmallDevice = width < 360;
  const horizontalPadding = isSmallDevice ? 14 : 20;

  const { data, isLoading, refetch } = useNegotiationByIdQuery(negotiationId);
  const negotiation = data?.negotiation as Negotiation | undefined;

  // ---- Real-time: auto-refresh when the other party acts ------------------
  useEffect(() => {
    const socket = SocketService.getInstance().getSocket();

    const handleNotification = (payload: any) => {
      const nid = payload?.data?.negotiationId;
      if (nid && String(nid) === String(negotiationId)) {
        refetch();
      }
    };

    socket.on("new_notification", handleNotification);
    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, [negotiationId, refetch]);

  const respondMutation = useRespondToOfferMutation();
  const counterResponseMutation = useCounterResponseMutation();
  const createOfferMutation = useCreateOfferMutation();

  const [respondingAction, setRespondingAction] = useState<
    "ACCEPT" | "DECLINE" | null
  >(null);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [sendingCounter, setSendingCounter] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [showMarkSoldModal, setShowMarkSoldModal] = useState(false);

  const markAsSoldMutation = useMarkCarAsSoldMutation();

  const handleMarkAsSold = () => {
    setShowMarkSoldModal(true);
  };

  const confirmMarkAsSold = () => {
    const carId = negotiation?.carId ?? negotiation?.Car?.id ?? negotiation?.car?.id;
    if (!carId) return;
    
    markAsSoldMutation.mutate(Number(carId), {
      onSuccess: () => {
        setShowMarkSoldModal(false);
      }
    });
  };

  const sortedOffers = useMemo(
    () =>
      [...(negotiation?.Offers ?? [])].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      }),
    [negotiation],
  );

  const latestOffer = sortedOffers[sortedOffers.length - 1];

  const isSeller =
    user?.id && negotiation?.sellerId
      ? Number(user.id) === Number(negotiation.sellerId)
      : user?.id && negotiation?.seller?.id
        ? Number(user.id) === Number(negotiation.seller.id)
        : false;

  const viewerRole: "BUYER" | "SELLER" = isSeller ? "SELLER" : "BUYER";

  // Awaiting viewer response check
  const awaitingViewerResponse = useMemo(() => {
    if (!negotiation || !latestOffer) return false;
    const isStatusActive =
      negotiation.status === "ACTIVE" ||
      negotiation.status === "PENDING" ||
      !negotiation.status;
    if (!isStatusActive) return false;
    if (latestOffer.status !== "PENDING" && latestOffer.status !== "COUNTERED")
      return false;

    if (viewerRole === "BUYER") {
      return latestOffer.type === "SELLER_COUNTER";
    } else {
      return latestOffer.type === "BUYER_OFFER";
    }
  }, [negotiation, latestOffer, viewerRole]);

  const attemptsUsed = sortedOffers.filter(
    (o) => o.type === "BUYER_OFFER",
  ).length;
  const attemptsRemaining =
    negotiation?.maxAttempts != null
      ? Math.max(negotiation.maxAttempts - attemptsUsed, 0)
      : null;

  const counterpart =
    viewerRole === "BUYER" ? negotiation?.seller : negotiation?.buyer;
  const counterpartName =
    counterpart?.name ||
    (viewerRole === "BUYER"
      ? t("negotiations.seller", "Seller")
      : t("negotiations.buyer", "Buyer"));

  // Pre-fill a generic message when deal is accepted
  useEffect(() => {
    const checkAndPrefill = async () => {
      if (negotiation?.status === "ACCEPTED" && counterpartName && !messageText) {
        // Check if we already sent a message for this negotiation
        const sentKey = `deal_msg_sent_${negotiationId}`;
        const alreadySent = await AsyncStorage.getItem(sentKey);
        
        if (alreadySent === "true") {
          setIsMessageSent(true);
          return; // Do not prefill!
        }

        const car = negotiation?.Car || negotiation?.car;
        const carTitle =
          car?.title ||
          [car?.brand, car?.model].filter(Boolean).join(" ") ||
          "the car";
        if (isSeller) {
          setMessageText(
            `Hi ${counterpartName}, I've accepted your offer on ${carTitle}. When would you like to arrange the meeting?`,
          );
        } else {
          setMessageText(
            `Hi ${counterpartName}, great news! My offer on ${carTitle} was accepted. When can we meet?`,
          );
        }
      }
    };
    checkAndPrefill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negotiation?.status, counterpartName]);

  // ---- Status pill config (header) --------------------------------------

  const statusConfig = useMemo(() => {
    const s = negotiation?.status;

    if (s === "ACCEPTED")
      return {
        label: t("negotiations.room.dealAgreed", "Deal Agreed"),
        color: "#10B981",
        bg: isDark ? "rgba(16,185,129,0.14)" : "#ECFDF5",
        Icon: CheckCircle2,
      };
    if (s === "REJECTED")
      return {
        label: t("negotiations.room.declined", "Declined"),
        color: "#EF4444",
        bg: isDark ? "rgba(239,68,68,0.14)" : "#FEF2F2",
        Icon: XCircle,
      };
    if (s === "EXPIRED")
      return {
        label: t("negotiations.room.expired", "Expired"),
        color: "#71717A",
        bg: isDark ? "rgba(113,113,122,0.16)" : "#F1F5F9",
        Icon: Clock3,
      };
    if (s === "CANCELLED")
      return {
        label: t("negotiations.room.cancelled", "Cancelled"),
        color: "#71717A",
        bg: isDark ? "rgba(113,113,122,0.16)" : "#F1F5F9",
        Icon: XCircle,
      };
    if (awaitingViewerResponse)
      return {
        label: t("negotiations.room.actionRequired", "Action Required"),
        color: "#3B82F6",
        bg: isDark ? "rgba(59,130,246,0.14)" : "#EFF6FF",
        Icon: RotateCcw,
      };
    return {
      label: t("negotiations.room.waiting", "Waiting for response"),
      color: "#F59E0B",
      bg: isDark ? "rgba(245,158,11,0.14)" : "#FFFBEB",
      Icon: Clock3,
    };
  }, [negotiation?.status, awaitingViewerResponse, isDark, t]);

  // ---- Actions ------------------------------------------------------------

  const handleAccept = async () => {
    if (!negotiation || !latestOffer) return;
    setRespondingAction("ACCEPT");
    try {
      if (viewerRole === "BUYER") {
        await counterResponseMutation.mutateAsync({
          offerId: latestOffer.id,
          action: "ACCEPT",
        });
      } else {
        await respondMutation.mutateAsync({
          offerId: latestOffer.id,
          action: "ACCEPT",
        });
      }
      refetch();
    } catch (e: any) {
      console.log("Accept error:", e);
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to accept offer",
      );
      refetch(); // Backend might have lazily marked it expired, refetch to update UI
    } finally {
      setRespondingAction(null);
    }
  };

  const handleDecline = async () => {
    if (!negotiation || !latestOffer) return;
    setRespondingAction("DECLINE");
    try {
      if (viewerRole === "BUYER") {
        await counterResponseMutation.mutateAsync({
          offerId: latestOffer.id,
          action: "REJECT",
        });
      } else {
        await respondMutation.mutateAsync({
          offerId: latestOffer.id,
          action: "REJECT",
        });
      }
      refetch();
    } catch (e: any) {
      console.log("Decline error:", e);
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to decline offer",
      );
      refetch(); // Backend might have lazily marked it expired, refetch to update UI
    } finally {
      setRespondingAction(null);
    }
  };

  const handleSendCounter = async () => {
    const amount = Number(counterAmount.replace(/[^0-9]/g, ""));
    if (!negotiation || !amount) return;
    setSendingCounter(true);
    try {
      if (viewerRole === "SELLER" && latestOffer) {
        await respondMutation.mutateAsync({
          offerId: latestOffer.id,
          action: "COUNTER",
          counterAmount: amount,
        });
      } else {
        await createOfferMutation.mutateAsync({
          negotiationId: negotiation.id,
          amount,
        });
      }
      setCounterAmount("");
      setShowCounterInput(false);
      refetch();
    } catch (e: any) {
      console.log("Counter error:", e);
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to send counter offer",
      );
      refetch(); // Backend might have lazily marked it expired, refetch to update UI
    } finally {
      setSendingCounter(false);
    }
  };

  const handleOpenChat = async () => {
    const otherUserId = counterpart?.id;
    if (!otherUserId) {
      Alert.alert("Error", "User details missing");
      return;
    }
    setOpeningChat(true);
    try {
      const response = await createOrGetConversation(Number(otherUserId));
      const convId =
        response?.conversation?.id || response?.id || response?.conv?.id;
      if (convId) {
        if (messageText.trim()) {
          const car = negotiation?.Car || negotiation?.car;
          const acceptedOffer =
            sortedOffers.find((o) => o.status === "ACCEPTED") || latestOffer;
          const counterpartName = counterpart?.name || "User";
          const finalContent = `__DEAL_REPLY__::${car?.title || "Car"}::${acceptedOffer?.amount || 0}::${counterpartName}::${negotiationId}::${messageText.trim()}`;
          await sendChatMessage({
            conversationId: convId,
            content: finalContent,
            senderId: user?.id,
            receiverId: Number(otherUserId),
          });
          setIsMessageSent(true);
          await AsyncStorage.setItem(`deal_msg_sent_${negotiationId}`, "true");
          setMessageText(""); // clear
        }
        router.push({
          pathname: "/ViewMessaageUse",
          params: {
            conversationId: convId.toString(),
            otherUserId: otherUserId.toString(),
            otherUserName: counterpart?.name || "User",
            otherUserPhoto: counterpart?.photo || "",
          },
        });
      }
    } catch (e) {
      console.log("Chat navigation error:", e);
    } finally {
      setOpeningChat(false);
    }
  };

  // ---- Skeleton ------------------------------------------------------------

  if (isLoading || !negotiation) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.bg}
        />
        <RoomSkeleton colors={colors} horizontalPadding={horizontalPadding} />
      </SafeAreaView>
    );
  }

  const car = negotiation.Car || negotiation.car;
  const carTitle =
    car?.title || `${car?.brand || ""} ${car?.model || ""}`.trim() || "Car";
  const StatusIcon = statusConfig.Icon;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bg}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: 8,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t("common.back", "Go back")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.surfaceMuted,
                marginRight: 10,
              }}
            >
              <ArrowLeft size={19} color={colors.textPrimary} />
            </TouchableOpacity>

            <Image
              source={{ uri: car?.images?.[0] || FALLBACK_CAR_IMAGE }}
              resizeMode="cover"
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.surfaceMuted,
                marginRight: 10,
              }}
            />

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "Lexend_600SemiBold",
                  fontSize: isSmallDevice ? 14 : 15,
                  color: colors.textPrimary,
                }}
              >
                {carTitle}
              </Text>
              {car?.price != null && (
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 1,
                    fontFamily: "Lexend_400Regular",
                    fontSize: 11,
                    color: colors.textMuted,
                  }}
                >
                  {t("negotiations.room.listed", "Listed")}: {money(car.price)}
                </Text>
              )}
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: 5,
              marginTop: 12,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: statusConfig.bg,
            }}
          >
            <StatusIcon size={13} color={statusConfig.color} />
            <Text
              style={{
                fontFamily: "Lexend_600SemiBold",
                fontSize: 12,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: 20,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {sortedOffers.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text
                style={{
                  fontFamily: "Lexend_400Regular",
                  fontSize: 14,
                  color: colors.textMuted,
                }}
              >
                No offers made yet.
              </Text>
            </View>
          ) : (
            sortedOffers.map((offer, index) => {
              const isViewerOffer =
                (viewerRole === "BUYER" && offer.type === "BUYER_OFFER") ||
                (viewerRole === "SELLER" && offer.type === "SELLER_COUNTER");
              const actor = isViewerOffer ? "You" : counterpartName;

              return (
                <TimelineNode
                  key={String(offer.id)}
                  offer={offer}
                  index={index}
                  isLast={index === sortedOffers.length - 1}
                  previousAmount={
                    index > 0 ? Number(sortedOffers[index - 1].amount) : null
                  }
                  isViewer={isViewerOffer}
                  actorName={actor}
                  colors={colors}
                  t={t}
                />
              );
            })
          )}

          {attemptsRemaining != null && negotiation.status === "ACTIVE" && (
            <Text
              style={{
                marginTop: 8,
                fontFamily: "Lexend_400Regular",
                fontSize: 11,
                color: colors.textMuted,
                textAlign: "center",
              }}
            >
              {t(
                "negotiations.room.attempts",
                "{{used}} of {{max}} attempts used",
                { used: attemptsUsed, max: negotiation.maxAttempts },
              )}
            </Text>
          )}
        </ScrollView>

        {/* Bottom action area */}
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: 12,
            paddingBottom: insets.bottom + 14,
            borderTopWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg,
          }}
        >
          {negotiation.status === "ACCEPTED" ? (
            <View
              style={{
                borderRadius: 18,
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#E2E8F0",
                overflow: "hidden",
              }}
            >
              {/* Header: Deal Agreed */}
              <View
                style={{
                  padding: 16,
                  backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "#ECFDF5",
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? "#334155" : "#E2E8F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <PartyPopper size={18} color="#10B981" />
                    <Text
                      style={{
                        fontFamily: "Lexend_700Bold",
                        fontSize: 15,
                        color: "#10B981",
                      }}
                    >
                      Offer Accepted
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Lexend_700Bold",
                      fontSize: 16,
                      color: "#10B981",
                    }}
                  >
                    {money(latestOffer?.amount ?? 0)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Lexend_400Regular",
                    fontSize: 13,
                    color: colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  {negotiation?.Car?.title || negotiation?.car?.title || "Car"}
                </Text>
              </View>

              {/* Message Input */}
              <View style={{ padding: 16 }}>
                <TextInput
                  value={messageText}
                  onChangeText={setMessageText}
                  editable={!isMessageSent}
                  placeholder={`Send a message to ${counterpart?.name || "the user"}...`}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  style={{
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 100,
                    color: colors.textPrimary,
                    fontFamily: "Lexend_400Regular",
                    textAlignVertical: "top",
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                    fontSize: 15,
                    opacity: isMessageSent ? 0.6 : 1,
                  }}
                />
              </View>

              {/* Action Button */}
              <View style={{ padding: 16, paddingTop: 0 }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleOpenChat}
                  disabled={openingChat || isMessageSent || !messageText.trim()}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 13,
                    borderRadius: 12,
                    backgroundColor: (isMessageSent || !messageText.trim()) ? colors.border : colors.accent,
                  }}
                >
                  {openingChat ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Send size={16} color={((isMessageSent || !messageText.trim()) && !isDark) ? colors.textMuted : "#FFFFFF"} />
                      <Text
                        style={{
                          fontFamily: "Lexend_600SemiBold",
                          fontSize: 14,
                          color: ((isMessageSent || !messageText.trim()) && !isDark) ? colors.textMuted : "#FFFFFF",
                        }}
                      >
                        {`Send to ${counterpart?.name || "User"}`}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Mark as Sold — Seller only */}
              {isSeller && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleMarkAsSold}
                    disabled={
                      markAsSoldMutation.isPending ||
                      negotiation?.Car?.status === "SOLD" ||
                      negotiation?.car?.status === "SOLD"
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingVertical: 13,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor:
                        negotiation?.Car?.status === "SOLD" ||
                        negotiation?.car?.status === "SOLD"
                          ? colors.border
                          : "#10B981",
                      backgroundColor: "transparent",
                      opacity:
                        negotiation?.Car?.status === "SOLD" ||
                        negotiation?.car?.status === "SOLD"
                          ? 0.5
                          : 1,
                    }}
                  >
                    {markAsSoldMutation.isPending ? (
                      <ActivityIndicator size="small" color="#10B981" />
                    ) : (
                      <>
                        <ShoppingBag size={16} color="#10B981" />
                        <Text
                          style={{
                            fontFamily: "Lexend_600SemiBold",
                            fontSize: 14,
                            color:
                              negotiation?.Car?.status === "SOLD" ||
                              negotiation?.car?.status === "SOLD"
                                ? colors.textMuted
                                : "#10B981",
                          }}
                        >
                          {negotiation?.Car?.status === "SOLD" ||
                          negotiation?.car?.status === "SOLD"
                            ? "Car Already Sold ✓"
                            : "Mark Car as Sold"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : negotiation.status === "REJECTED" ||
            negotiation.status === "EXPIRED" ||
            negotiation.status === "CANCELLED" ? (
            <View
              style={{
                borderRadius: 16,
                padding: 14,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Text
                style={{
                  fontFamily: "Lexend_500Medium",
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                {negotiation.status === "REJECTED"
                  ? t(
                      "negotiations.room.declinedMsg",
                      "This negotiation was declined.",
                    )
                  : negotiation.status === "EXPIRED"
                    ? t(
                        "negotiations.room.expiredMsg",
                        "This offer has expired.",
                      )
                    : t(
                        "negotiations.room.cancelledMsg",
                        "This negotiation was cancelled.",
                      )}
              </Text>
            </View>
          ) : awaitingViewerResponse && latestOffer ? (
            <View>
              <View
                style={{
                  borderRadius: 18,
                  padding: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "#000",
                  shadowOpacity: isDark ? 0 : 0.08,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: -2 },
                  elevation: isDark ? 0 : 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Lexend_500Medium",
                    fontSize: 12,
                    color: colors.textMuted,
                    marginBottom: 3,
                  }}
                >
                  {counterpartName}
                  {viewerRole === "BUYER" ? "'s Counter-Offer" : "'s Offer"}
                </Text>
                <Text
                  style={{
                    fontFamily: "Lexend_700Bold",
                    fontSize: 24,
                    color: colors.accent,
                    marginBottom: 14,
                  }}
                >
                  {money(latestOffer.amount)}
                </Text>

                {!showCounterInput ? (
                  <>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleDecline}
                        disabled={respondingAction !== null}
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 13,
                          borderRadius: 12,
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        {respondingAction === "DECLINE" ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.textSecondary}
                          />
                        ) : (
                          <Text
                            style={{
                              fontFamily: "Lexend_600SemiBold",
                              fontSize: 14,
                              color: colors.textSecondary,
                            }}
                          >
                            {t("negotiations.room.decline", "Decline")}
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleAccept}
                        disabled={respondingAction !== null}
                        style={{
                          flex: 1.4,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 13,
                          borderRadius: 12,
                          backgroundColor: colors.accent,
                        }}
                      >
                        {respondingAction === "ACCEPT" ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text
                            style={{
                              fontFamily: "Lexend_600SemiBold",
                              fontSize: 14,
                              color: "#FFFFFF",
                            }}
                          >
                            {t("negotiations.room.accept", "Accept")}{" "}
                            {money(latestOffer.amount)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowCounterInput(true)}
                      style={{ alignItems: "center", marginTop: 12 }}
                    >
                      <Text
                        style={{
                          fontFamily: "Lexend_500Medium",
                          fontSize: 12,
                          color: colors.accent,
                        }}
                      >
                        {viewerRole === "SELLER"
                          ? "Send counter-offer"
                          : "Make another offer"}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        marginBottom: 10,
                        backgroundColor: colors.surfaceMuted,
                      }}
                    >
                      <TextInput
                        value={counterAmount}
                        onChangeText={setCounterAmount}
                        keyboardType="number-pad"
                        placeholder={t(
                          "negotiations.room.yourOfferPlaceholder",
                          "Your offer",
                        )}
                        placeholderTextColor={colors.textMuted}
                        style={{
                          flex: 1,
                          paddingVertical: 13,
                          fontFamily: "Lexend_600SemiBold",
                          fontSize: 16,
                          color: colors.textPrimary,
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: "Lexend_500Medium",
                          fontSize: 13,
                          color: colors.textMuted,
                        }}
                      >
                        DH
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowCounterInput(false)}
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 13,
                          borderRadius: 12,
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Lexend_600SemiBold",
                            fontSize: 14,
                            color: colors.textSecondary,
                          }}
                        >
                          {t("common.cancel", "Cancel")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleSendCounter}
                        disabled={!counterAmount || sendingCounter}
                        style={{
                          flex: 1.4,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 13,
                          borderRadius: 12,
                          backgroundColor: colors.accent,
                          opacity: !counterAmount ? 0.5 : 1,
                        }}
                      >
                        {sendingCounter ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text
                            style={{
                              fontFamily: "Lexend_600SemiBold",
                              fontSize: 14,
                              color: "#FFFFFF",
                            }}
                          >
                            {t("negotiations.room.sendOffer", "Send Offer")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <Clock3 size={14} color={colors.textMuted} />
              <Text
                style={{
                  fontFamily: "Lexend_500Medium",
                  fontSize: 13,
                  color: colors.textSecondary,
                }}
              >
                {t(
                  "negotiations.room.waitingBanner",
                  "Waiting for {{name}}'s response",
                  { name: counterpartName },
                )}
              </Text>
            </View>
          )}

          {/* Report Negotiation Button */}
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/ReportScreen",
                params: { targetType: "NEGOTIATION", targetId: negotiationId?.toString() }
              });
            }}
            style={{
              alignItems: "center",
              marginTop: 16,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "Lexend_400Regular",
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              {t("negotiations.room.report", "Something went wrong? Report this negotiation")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Mark As Sold Custom Modal */}
      <Modal
        visible={showMarkSoldModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMarkSoldModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ 
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF", 
            borderRadius: 24, 
            padding: 20, 
            width: "100%", 
            maxWidth: 400,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10
          }}>
            {/* Icon */}
            <View style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 24, 
              backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "#ECFDF5", 
              justifyContent: "center", 
              alignItems: "center", 
              alignSelf: "center",
              marginBottom: 12
            }}>
              <ShoppingBag size={24} color="#10B981" />
            </View>

            {/* Texts */}
            <Text style={{ 
              fontFamily: "Lexend_700Bold", 
              fontSize: 18, 
              color: isDark ? "#F8FAFC" : "#0F172A", 
              textAlign: "center", 
              marginBottom: 8 
            }}>
              Mark Car as Sold?
            </Text>
            <Text style={{ 
              fontFamily: "Lexend_400Regular", 
              fontSize: 14, 
              color: colors.textMuted, 
              textAlign: "center", 
              lineHeight: 20,
              marginBottom: 20 
            }}>
              This will close all open negotiations on this car and notify other buyers. Are you sure you want to proceed?
            </Text>

            {/* Buttons */}
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={confirmMarkAsSold}
                disabled={markAsSoldMutation.isPending}
                style={{
                  backgroundColor: "#10B981",
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {markAsSoldMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#FFF" />
                    <Text style={{ fontFamily: "Lexend_600SemiBold", fontSize: 15, color: "#FFF" }}>
                      Yes, Mark as Sold
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowMarkSoldModal(false)}
                disabled={markAsSoldMutation.isPending}
                style={{
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#E2E8F0"
                }}
              >
                <Text style={{ fontFamily: "Lexend_600SemiBold", fontSize: 15, color: colors.textPrimary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ---- Timeline node ---------------------------------------------------------

// ---- Offer Countdown -------------------------------------------------------

function useOfferCountdown(expiresAt?: string) {
  const calc = () => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { expired: true, label: "Expired", urgent: true };
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    const label =
      h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
    return { expired: false, label: `Expires in ${label}`, urgent: diff < 3_600_000 };
  };

  const [state, setState] = useState(calc);

  useEffect(() => {
    if (!expiresAt) return;
    setState(calc());
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  return state;
}

function TimelineNode({

  offer,
  index,
  isLast,
  previousAmount,
  isViewer,
  actorName,
  colors,
  t,
}: {
  offer: Offer;
  index: number;
  isLast: boolean;
  previousAmount: number | null;
  isViewer: boolean;
  actorName: string;
  colors: ReturnType<typeof getColors>;
  t: (key: string, fallback: string) => string;
}) {
  const amount = Number(offer.amount);
  const countdown = useOfferCountdown(
    offer.status === "PENDING" ? offer.expiresAt : undefined
  );

  const actionLabel = useMemo(() => {
    if (index === 0)
      return t("negotiations.room.offerSubmitted", "Offer submitted");
    if (offer.status === "ACCEPTED")
      return t("negotiations.room.accepted", "Accepted");
    if (offer.status === "REJECTED" || offer.status === "AUTO_REJECTED")
      return t("negotiations.room.declined", "Declined");
    if (offer.status === "EXPIRED")
      return t("negotiations.room.expired", "Expired");
    return offer.type === "SELLER_COUNTER"
      ? "Counter-offer"
      : "Offer submitted";
  }, [index, offer.status, offer.type, t]);

  const dotColor =
    offer.status === "ACCEPTED"
      ? "#10B981"
      : offer.status === "REJECTED" || offer.status === "AUTO_REJECTED"
        ? "#EF4444"
        : isViewer
          ? colors.accent
          : colors.textMuted;

  const diff = previousAmount != null ? amount - previousAmount : null;

  return (
    <View style={{ flexDirection: "row" }}>
      {/* Line + dot */}
      <View style={{ width: 20, alignItems: "center" }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: dotColor,
            marginTop: 4,
          }}
        />
        {!isLast && (
          <View
            style={{
              flex: 1,
              width: 2,
              backgroundColor: colors.line,
              marginTop: 2,
            }}
          />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingBottom: isLast ? 4 : 24, marginLeft: 10 }}>
        <Text
          style={{
            fontFamily: "Lexend_600SemiBold",
            fontSize: 10,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: isViewer ? colors.accent : colors.textMuted,
            marginBottom: 3,
          }}
        >
          {actorName}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              fontFamily: "Lexend_700Bold",
              fontSize: 18,
              color: colors.textPrimary,
            }}
          >
            {money(amount)}
          </Text>

          {diff != null && diff !== 0 && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              {diff > 0 ? (
                <ArrowUpRight size={12} color={colors.textMuted} />
              ) : (
                <ArrowDownRight size={12} color={colors.textMuted} />
              )}
              <Text
                style={{
                  fontFamily: "Lexend_400Regular",
                  fontSize: 11,
                  color: colors.textMuted,
                }}
              >
                {money(Math.abs(diff))}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}
        >
          <Text
            style={{
              fontFamily: "Lexend_400Regular",
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            {actionLabel}
          </Text>
          {offer.createdAt && (
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
                style={{
                  fontFamily: "Lexend_400Regular",
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
                {eventTime(offer.createdAt)}
              </Text>
            </>
          )}
        </View>

        {/* Countdown badge */}
        {countdown && offer.status === "PENDING" && (
          <View
            style={{
              marginTop: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              alignSelf: "flex-start",
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor: countdown.urgent
                ? "rgba(239,68,68,0.10)"
                : "rgba(59,130,246,0.10)",
            }}
          >
            <Clock3
              size={11}
              color={countdown.urgent ? "#EF4444" : "#3B82F6"}
            />
            <Text
              style={{
                fontFamily: "Lexend_500Medium",
                fontSize: 11,
                color: countdown.urgent ? "#EF4444" : "#3B82F6",
              }}
            >
              {countdown.label}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ---- Skeleton ---------------------------------------------------------

function RoomSkeleton({
  colors,
  horizontalPadding,
}: {
  colors: ReturnType<typeof getColors>;
  horizontalPadding: number;
}) {
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

  const Block = ({
    w,
    h,
    r = 8,
  }: {
    w: number | string;
    h: number;
    r?: number;
  }) => (
    <Animated.View
      style={{
        width: w,
        height: h,
        borderRadius: r,
        backgroundColor: colors.skeleton,
        opacity: pulse,
      }}
    />
  );

  return (
    <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 14 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
      >
        <Block w={38} h={38} r={19} />
        <Block w={42} h={42} r={12} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Block w="60%" h={14} />
          <View style={{ height: 6 }} />
          <Block w="35%" h={10} />
        </View>
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 24 }}>
          <Block w={10} h={10} r={5} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Block w="30%" h={10} />
            <View style={{ height: 8 }} />
            <Block w="45%" h={18} />
          </View>
        </View>
      ))}
    </View>
  );
}
