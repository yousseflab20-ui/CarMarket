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

const { width } = Dimensions.get("window");

export default function ProfileUser() {

    const { user, logout, refreshProfile } = useAuthStore() as AuthState;
    const { t } = useTranslation();

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
            <View className="flex-1 justify-center items-center bg-[#0B0E14]">
                <Text className="text-white text-base" style={{ fontFamily: "Lexend_500Medium" }}>{t('profile.loadingUser')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E14" }}>
            <View className="flex-row items-center justify-between px-5 py-3.5 mb-2.5">
                <TouchableOpacity onPress={() => router.back()} className="w-[42px] h-[42px] rounded-[14px] bg-white/[0.05] border border-white/[0.08] items-center justify-center">
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl tracking-wider" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.title')}</Text>
                <TouchableOpacity
                    className="w-10 h-10 rounded-[13px] bg-[#EF4444]/15 border border-[#EF4444]/35 items-center justify-center"
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
                        className="w-[144px] h-[144px] rounded-full p-1 bg-[#3B82F6]"
                        style={{
                            shadowColor: "#3B82F6",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 24,
                            elevation: 12,
                        }}
                    >
                        <View className="w-full h-full rounded-full overflow-hidden bg-[#1C1F26] border-3 border-[#0B0E14]">
                            <Image
                                source={{ uri: user.photo }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                    <View
                        className="absolute bottom-2 w-8 h-8 rounded-full bg-[#3B82F6] border-3 border-[#0B0E14] items-center justify-center"
                        style={{
                            right: width / 2 - 84,
                            shadowColor: "#3B82F6",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <Star size={11} color="#fff" fill="#fff" />
                    </View>
                </Animated.View>

                <Animated.View
                    className="items-center mb-7 px-5"
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-[28px] text-white tracking-wider" style={{ fontFamily: "Lexend_800ExtraBold" }}>{user.name}</Text>
                        {user.verificationStatus === 'approved' && (
                            <View className="w-6 h-6 items-center justify-center mt-0.5">
                                <BadgeCheck size={22} color="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                            </View>
                        )}
                    </View>
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <Mail size={13} color="#64748B" />
                        <Text className="text-sm text-[#64748B]" style={{ fontFamily: "Lexend_400Regular" }}>{user.email}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 bg-[#3B82F6]/10 px-3.5 py-1.5 rounded-full border border-[#3B82F6]/20">
                        <Shield size={13} color={user.verificationStatus === 'approved' ? "#22C55E" : "#3B82F6"} />
                        <Text
                            className="text-[#3B82F6] text-[13px]"
                            style={[{ fontFamily: "Lexend_600SemiBold" }, user.verificationStatus === 'approved' && { color: "#22C55E" }]}
                        >
                            {user.verificationStatus === 'approved' ? t('profile.verifiedSeller') : t('profile.premiumMember')}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View className="flex-row px-5 gap-2.5 mb-5" style={{ opacity: fadeAnim }}>
                    <View className="flex-1 bg-[#1C1F26] rounded-[20px] p-3.5 items-center border border-white/[0.05]">
                        <View className="w-9 h-9 rounded-[12px] bg-[#3B82F6]/12 items-center justify-center mb-2">
                            <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        </View>
                        <Text className="text-sm text-white mb-1" style={{ fontFamily: "Lexend_700Bold" }}>{Number(ratingData?.averageRating || 0).toFixed(1)}</Text>
                        <Text className="text-[11px] text-[#64748B] tracking-wider" style={{ fontFamily: "Lexend_400Regular" }}>{ratingData?.totalRatings ?? 0} {t('profile.reviews')}</Text>
                    </View>
                    <View className="flex-1 bg-[#1C1F26] rounded-[20px] p-3.5 items-center border border-white/[0.05]">
                        <View className="w-9 h-9 rounded-[12px] bg-[#8B5CF6]/12 items-center justify-center mb-2">
                            <Hash size={16} color="#8B5CF6" />
                        </View>
                        <Text className="text-sm text-white mb-1" style={{ fontFamily: "Lexend_700Bold" }}>{user.id}</Text>
                        <Text className="text-[11px] text-[#64748B] tracking-wider" style={{ fontFamily: "Lexend_400Regular" }}>{t('profile.userId')}</Text>
                    </View>
                    <View className="flex-1 bg-[#1C1F26] rounded-[20px] p-3.5 items-center border border-white/[0.05]">
                        <View className="w-9 h-9 rounded-[12px] bg-[#22C55E]/10 items-center justify-center mb-2">
                            <View className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                        </View>
                        <Text className="text-sm mb-1 text-[#22C55E]" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.online')}</Text>
                        <Text className="text-[11px] text-[#64748B] tracking-wider" style={{ fontFamily: "Lexend_400Regular" }}>{t('profile.status')}</Text>
                    </View>
                </Animated.View>

                <Animated.View
                    className="mx-5 bg-[#1C1F26] rounded-[24px] p-5 mb-5 border border-white/[0.05]"
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    <Text className="text-[13px] text-[#64748B] mb-4.5 tracking-wider uppercase" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.accountDetails')}</Text>

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center bg-[#3B82F6]/10">
                                <Mail size={14} color="#3B82F6" />
                            </View>
                            <Text className="text-[#94A3B8] text-sm" style={{ fontFamily: "Lexend_500Medium" }}>{t('profile.email')}</Text>
                        </View>
                        <Text className="text-white text-[13px] flex-1 text-right ml-4" style={{ fontFamily: "Lexend_600SemiBold" }} numberOfLines={1}>{user.email}</Text>
                    </View>

                    <View className="h-[1px] bg-white/[0.05] ml-11" />

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center bg-[#8B5CF6]/10">
                                <Hash size={14} color="#8B5CF6" />
                            </View>
                            <Text className="text-[#94A3B8] text-sm" style={{ fontFamily: "Lexend_500Medium" }}>{t('profile.userId')}</Text>
                        </View>
                        <Text className="text-white text-[13px] flex-1 text-right ml-4" style={{ fontFamily: "Lexend_600SemiBold" }}>{user.id}</Text>
                    </View>

                    <View className="h-[1px] bg-white/[0.05] ml-11" />

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center" style={{
                                backgroundColor:
                                    user.verificationStatus === 'approved' ? "rgba(34,197,94,0.1)" :
                                        user.verificationStatus === 'pending' ? "rgba(245,158,11,0.1)" :
                                            user.verificationStatus === 'rejected' ? "rgba(239,68,68,0.1)" :
                                                "rgba(100,116,139,0.1)"
                            }}>
                                <Shield size={14} color={
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                "#64748B"
                                } />
                            </View>
                            <Text className="text-[#94A3B8] text-sm" style={{ fontFamily: "Lexend_500Medium" }}>{t('profile.verification')}</Text>
                        </View>
                        <View className={[
                            "flex-row items-center gap-1.5 px-2.5 py-1 rounded-[10px] border",
                            user.verificationStatus === 'approved' ? "bg-[#22C55E]/10 border-[#22C55E]/25" :
                                user.verificationStatus === 'pending' ? "bg-[#F59E0B]/10 border-[#F59E0B]/25" :
                                    user.verificationStatus === 'rejected' ? "bg-[#EF4444]/10 border-[#EF4444]/25" :
                                        "bg-[#64748B]/10 border-[#64748B]/25"
                        ].join(" ")}>
                            <View className="w-1.5 h-1.5 rounded-full" style={{
                                backgroundColor:
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                "#64748B"
                            }} />
                            <Text className="text-[12px]" style={[{ fontFamily: "Lexend_600SemiBold" }, {
                                color:
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                "#64748B"
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
                        className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg mb-1 bg-[#475569]"
                        style={{
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
                                <Settings size={18} color="#fff" />
                            </View>
                            <Text className="text-white text-base" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.settings')}</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg mb-1 bg-[#10B981]"
                        style={{
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
                                <TrendingUp size={18} color="#fff" />
                            </View>
                            <Text className="text-white text-base" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.sellerDashboard')}</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    {user.role === 'ADMIN' && (
                        <TouchableOpacity
                            className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg mb-1 bg-[#8B5CF6]"
                            style={{
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
                                    <Shield size={18} color="#fff" />
                                </View>
                                <Text className="text-white text-base" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.adminDashboard')}</Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}

                    {(!user.verificationStatus || user.verificationStatus === 'none' || user.verificationStatus === 'rejected') && (
                        <TouchableOpacity
                            className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg bg-[#F59E0B]"
                            style={{
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
                                    <Shield size={18} color="#fff" />
                                </View>
                                <Text className="text-white text-base" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.getVerified')}</Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}

                    {user.verificationStatus === 'pending' && (
                        <View 
                            className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg bg-[#94A3B8] opacity-80"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-[12px] items-center justify-center bg-white/15">
                                    <Shield size={18} color="#fff" />
                                </View>
                                <Text className="text-white text-base" style={{ fontFamily: "Lexend_700Bold" }}>{t('profile.verificationPending')}</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
