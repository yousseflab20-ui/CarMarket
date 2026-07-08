import { View, Text, Image, TouchableOpacity, ScrollView, Animated, Dimensions } from "react-native";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ArrowLeft, Mail, Hash, Shield, Star, ChevronRight, BadgeCheck, TrendingUp, Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getSellerRating } from "../service/rating/endpointrating";
import { useQuery } from "@tanstack/react-query";
import { SellerRatingResponse } from "../types/rating";
import { AuthState } from "../types/store/auth";
import { useAppTheme } from "../hooks/useAppTheme";

const { width } = Dimensions.get("window");

export default function ProfileUser() {

    const { user, logout, refreshProfile } = useAuthStore() as AuthState;
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

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
    };

    const userIdNum = user?.id ? Number(user.id) : undefined;

    const { data: ratingData } = useQuery<SellerRatingResponse, Error>({
        queryKey: ["getSellerRating", userIdNum],
        queryFn: () => getSellerRating(userIdNum!),
        enabled: !!userIdNum
    });
    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [])
    );

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const avatarScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
            Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 8, delay: 150, useNativeDriver: true }),
        ]).start();
    }, []);

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: C.bg }}>
                <Text className="text-base" style={{ color: C.white, fontFamily: "Lexend_500Medium" }}>{t('profile.loadingUser')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <View className="flex-row items-center justify-between px-5 py-3.5 mb-2.5">
                <TouchableOpacity onPress={() => router.back()} className="w-[42px] h-[42px] rounded-[14px] items-center justify-center border" style={{ backgroundColor: C.iconBg, borderColor: C.border }}>
                    <ArrowLeft size={20} color={C.white} />
                </TouchableOpacity>
                <Text className="text-xl tracking-wider" style={{ color: C.white, fontFamily: "Lexend_700Bold" }}>{t('profile.title')}</Text>
                <TouchableOpacity
                    className="w-10 h-10 rounded-[13px] items-center justify-center border"
                    style={{ backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.35)" }}
                    onPress={logout}
                >
                    <LogOut size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                <Animated.View
                    className="items-center mb-6"
                    style={{ opacity: fadeAnim, transform: [{ scale: avatarScale }] }}
                >
                    <View
                        className="w-[144px] h-[144px] rounded-full p-1"
                        style={{
                            backgroundColor: C.blue,
                            shadowColor: C.blue,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 24,
                            elevation: 12,
                        }}
                    >
                        <View className="w-full h-full rounded-full overflow-hidden border-3" style={{ backgroundColor: C.surface, borderColor: C.bg }}>
                            <Image
                                source={{ uri: user.photo }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                    <View
                        className="absolute bottom-2 w-8 h-8 rounded-full border-3 items-center justify-center"
                        style={{
                            backgroundColor: C.blue,
                            borderColor: C.bg,
                            right: width / 2 - 84,
                            shadowColor: C.blue,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <Star size={11} color={C.whitePure} fill={C.whitePure} />
                    </View>
                </Animated.View>

                <Animated.View
                    className="items-center mb-7 px-5"
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-[28px] tracking-wider" style={{ color: C.white, fontFamily: "Lexend_800ExtraBold" }}>{user.name}</Text>
                        {user.verificationStatus === 'approved' && (
                            <View className="w-6 h-6 items-center justify-center mt-0.5">
                                <BadgeCheck size={22} color={C.blue} fill={C.blue} fillOpacity={0.1} />
                            </View>
                        )}
                    </View>
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <Mail size={13} color={C.muted} />
                        <Text className="text-sm" style={{ color: C.muted, fontFamily: "Lexend_400Regular" }}>{user.email}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border" style={{ backgroundColor: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.2)" }}>
                        <Shield size={13} color={user.verificationStatus === 'approved' ? "#22C55E" : C.blue} />
                        <Text
                            className="text-[13px]"
                            style={[{ color: C.blue, fontFamily: "Lexend_600SemiBold" }, user.verificationStatus === 'approved' && { color: "#22C55E" }]}
                        >
                            {user.verificationStatus === 'approved' ? t('profile.verifiedSeller') : t('profile.premiumMember')}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View className="flex-row px-5 gap-2.5 mb-5" style={{ opacity: fadeAnim }}>
                    <View className="flex-1 rounded-[20px] p-3.5 items-center border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <View className="w-9 h-9 rounded-[12px] items-center justify-center mb-2" style={{ backgroundColor: "rgba(59,130,246,0.12)" }}>
                            <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        </View>
                        <Text className="text-sm mb-1" style={{ color: C.white, fontFamily: "Lexend_700Bold" }}>{Number(ratingData?.averageRating || 0).toFixed(1)}</Text>
                        <Text className="text-[11px] tracking-wider" style={{ color: C.muted, fontFamily: "Lexend_400Regular" }}>{ratingData?.totalRatings ?? 0} {t('profile.reviews')}</Text>
                    </View>
                    <View className="flex-1 rounded-[20px] p-3.5 items-center border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <View className="w-9 h-9 rounded-[12px] items-center justify-center mb-2" style={{ backgroundColor: "rgba(139,92,246,0.12)" }}>
                            <Hash size={16} color="#8B5CF6" />
                        </View>
                        <Text className="text-sm mb-1" style={{ color: C.white, fontFamily: "Lexend_700Bold" }}>{user.id}</Text>
                        <Text className="text-[11px] tracking-wider" style={{ color: C.muted, fontFamily: "Lexend_400Regular" }}>{t('profile.userId')}</Text>
                    </View>
                    <View className="flex-1 rounded-[20px] p-3.5 items-center border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                        <View className="w-9 h-9 rounded-[12px] items-center justify-center mb-2" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                            <View className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                        </View>
                        <Text className="text-sm mb-1 text-[#22C55E]" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.online')}</Text>
                        <Text className="text-[11px] tracking-wider" style={{ color: C.muted, fontFamily: "Lexend_400Regular" }}>{t('profile.status')}</Text>
                    </View>
                </Animated.View>

                <Animated.View
                    className="mx-5 rounded-[24px] p-5 mb-5 border"
                    style={{ backgroundColor: C.surface, borderColor: C.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    <Text className="text-[13px] mb-4.5 tracking-wider uppercase" style={{ color: C.muted, fontFamily: "Lexend_700Bold" }}>{t('profile.accountDetails')}</Text>

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center" style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
                                <Mail size={14} color={C.blue} />
                            </View>
                            <Text className="text-sm" style={{ color: C.textDim, fontFamily: "Lexend_500Medium" }}>{t('profile.email')}</Text>
                        </View>
                        <Text className="text-[13px] flex-1 text-right ml-4" style={{ color: C.white, fontFamily: "Lexend_600SemiBold" }} numberOfLines={1}>{user.email}</Text>
                    </View>

                    <View className="h-[1px] ml-11" style={{ backgroundColor: C.border }} />

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center" style={{ backgroundColor: "rgba(139,92,246,0.1)" }}>
                                <Hash size={14} color="#8B5CF6" />
                            </View>
                            <Text className="text-sm" style={{ color: C.textDim, fontFamily: "Lexend_500Medium" }}>{t('profile.userId')}</Text>
                        </View>
                        <Text className="text-[13px] flex-1 text-right ml-4" style={{ color: C.white, fontFamily: "Lexend_600SemiBold" }}>{user.id}</Text>
                    </View>

                    <View className="h-[1px] ml-11" style={{ backgroundColor: C.border }} />

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center" style={{
                                backgroundColor:
                                    user.verificationStatus === 'approved' ? "rgba(34,197,94,0.1)" :
                                        user.verificationStatus === 'pending' ? "rgba(245,158,11,0.1)" :
                                            user.verificationStatus === 'rejected' ? "rgba(239,68,68,0.1)" :
                                                isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                            }}>
                                <Shield size={14} color={
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                C.muted
                                } />
                            </View>
                            <Text className="text-sm" style={{ color: C.textDim, fontFamily: "Lexend_500Medium" }}>{t('profile.verification')}</Text>
                        </View>
                        <View className={[
                            "flex-row items-center gap-1.5 px-2.5 py-1 rounded-[10px] border",
                            user.verificationStatus === 'approved' ? "bg-[#22C55E]/10 border-[#22C55E]/25" :
                                user.verificationStatus === 'pending' ? "bg-[#F59E0B]/10 border-[#F59E0B]/25" :
                                    user.verificationStatus === 'rejected' ? "bg-[#EF4444]/10 border-[#EF4444]/25" :
                                        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                        ].join(" ")}>
                            <View className="w-1.5 h-1.5 rounded-full" style={{
                                backgroundColor:
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                C.muted
                            }} />
                            <Text className="text-[12px]" style={[{ fontFamily: "Lexend_600SemiBold" }, {
                                color:
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                C.muted
                            }]}>
                                {user.verificationStatus === 'approved' ? t('profile.statusApproved') :
                                    user.verificationStatus === 'pending' ? t('profile.statusPending') :
                                        user.verificationStatus === 'rejected' ? t('profile.statusRejected') :
                                            t('profile.statusNone')}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View className="px-5 gap-2.5" style={{ opacity: fadeAnim }}>

                    <TouchableOpacity
                        className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg mb-1"
                        style={{
                            backgroundColor: "#475569",
                            shadowColor: "#475569",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 5,
                        }}
                        onPress={() => router.push("/settings/SettingsScreen")}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-[12px] items-center justify-center bg-white/15">
                                <Settings size={18} color={C.whitePure} />
                            </View>
                            <Text className="text-base" style={{ color: C.whitePure, fontFamily: "Lexend_700Bold" }}>{t('profile.settings')}</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg mb-1"
                        style={{
                            backgroundColor: "#10B981",
                            shadowColor: "#10B981",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 5,
                        }}
                        onPress={() => router.push("/SellerDashboard")}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-[12px] items-center justify-center bg-white/15">
                                <TrendingUp size={18} color={C.whitePure} />
                            </View>
                            <Text className="text-base" style={{ color: C.whitePure, fontFamily: "Lexend_700Bold" }}>{t('profile.sellerDashboard')}</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    {user.role === 'ADMIN' && (
                        <TouchableOpacity
                            className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg mb-1"
                            style={{
                                backgroundColor: "#8B5CF6",
                                shadowColor: "#8B5CF6",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                                elevation: 5,
                            }}
                            onPress={() => router.push("/admin/HomeScreenAdmin")}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-[12px] items-center justify-center bg-white/15">
                                    <Shield size={18} color={C.whitePure} />
                                </View>
                                <Text className="text-base" style={{ color: C.whitePure, fontFamily: "Lexend_700Bold" }}>{t('profile.adminDashboard')}</Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}

                    {(!user.verificationStatus || user.verificationStatus === 'none' || user.verificationStatus === 'rejected') && (
                        <TouchableOpacity
                            className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg"
                            style={{
                                backgroundColor: "#F59E0B",
                                shadowColor: "#F59E0B",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                                elevation: 5,
                            }}
                            onPress={() => router.push("/VerificationScreen")}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-[12px] items-center justify-center bg-white/15">
                                    <Shield size={18} color={C.whitePure} />
                                </View>
                                <Text className="text-base" style={{ color: C.whitePure, fontFamily: "Lexend_700Bold" }}>{t('profile.getVerified')}</Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}

                    {user.verificationStatus === 'pending' && (
                        <View 
                            className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg opacity-80"
                            style={{ backgroundColor: "#94A3B8" }}
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-[12px] items-center justify-center bg-white/15">
                                    <Shield size={18} color={C.whitePure} />
                                </View>
                                <Text className="text-base" style={{ color: C.whitePure, fontFamily: "Lexend_700Bold" }}>{t('profile.verificationPending')}</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
