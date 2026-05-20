import { View, Text, Image, TouchableOpacity, ScrollView, Animated, Dimensions, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Hash, Shield, Star, MessageCircle, ChevronRight, BadgeCheck } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getSellerRating } from "../service/rating/endpointrating";
import { useQuery, useMutation } from "@tanstack/react-query";
import { message } from "../service/chat/endpoint.message";
import { User } from "../types/user";
import { SellerRatingResponse } from "../types/rating";

const { width } = Dimensions.get("window");

export default function SellerProfile() {
    const { t } = useTranslation();
    const { user } = useLocalSearchParams<any>();
    const userObj = user ? JSON.parse(user as string) as User : null;
    const userIdNum = userObj?.id ? Number(userObj.id) : undefined;

    const { data: ratingData } = useQuery<SellerRatingResponse, Error>({
        queryKey: ["getSellerRating", userIdNum],
        queryFn: () => getSellerRating(userIdNum!),
        enabled: !!userIdNum
    });

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

    const messageMutation = useMutation({
        mutationFn: (userId: number) => message(userId),
    });

    const handleContact = () => {
        if (!userIdNum) {
            Alert.alert(t('seller.error'), t('carDetail.sellerInfoMissing'));
            return;
        }

        messageMutation.mutate(userIdNum, {
            onSuccess: (data: any) => {
                const conversationId = data?.conversation?.id || data?.id || data?.conv?.id;
                if (conversationId) {
                    router.push({
                        pathname: "/ViewMessaageUse",
                        params: {
                            conversationId: conversationId.toString(),
                            otherUserId: userIdNum.toString(),
                            otherUserName: userObj?.name || t('seller.unknownSeller'),
                            otherUserPhoto: userObj?.photo || "",
                        },
                    });
                } else {
                    Alert.alert(t('seller.error'), t('carDetail.failedConversation'));
                }
            },
            onError: (err: any) => {
                console.error("❌ Failed to open conversation:", err);
                Alert.alert(t('seller.error'), t('carDetail.couldNotOpenConversation'));
            },
        });
    };

    if (!userObj) {
        return (
            <View className="flex-1 justify-center items-center bg-[#09090B]">
                <Text className="text-white text-base" style={{ fontFamily: "Lexend_500Medium" }}>{t('seller.dataMissing')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
            <View className="flex-row items-center justify-between px-5 py-3.5 mb-2.5">
                <TouchableOpacity onPress={() => router.back()} className="w-[42px] h-[42px] rounded-[14px] bg-white/[0.05] border border-white/[0.08] items-center justify-center">
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl tracking-wider" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.profile')}</Text>
                <View className="w-[42px]" />
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
                        className={userObj.verified ? "w-[144px] h-[144px] rounded-full p-1 bg-[#3B82F6]" : "w-[144px] h-[144px] rounded-full p-1 bg-transparent"}
                        style={userObj.verified ? {
                            shadowColor: "#3B82F6",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 24,
                            elevation: 12,
                        } : undefined}
                    >
                        <View className="w-full h-full rounded-full overflow-hidden bg-[#18181B] border-3 border-[#09090B]">
                            {userObj.photo ? (
                                <Image
                                    source={{ uri: userObj.photo }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-full bg-[#1E2A3A] items-center justify-center">
                                    <Text className="text-white text-[48px]" style={{ fontFamily: "Lexend_700Bold" }}>
                                        {(userObj.name?.[0] || "?").toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    {userObj.verified && (
                        <View 
                            className="absolute bottom-2 w-8 h-8 rounded-full bg-[#09090B] border-2 border-[#3B82F6] items-center justify-center"
                            style={{
                                right: width / 2 - 84,
                                shadowColor: "#3B82F6",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.5,
                                shadowRadius: 8,
                                elevation: 6,
                            }}
                        >
                            <BadgeCheck size={16} color="#3B82F6" fill="#fff" />
                        </View>
                    )}
                </Animated.View>

                <Animated.View 
                    className="items-center mb-7 px-5" 
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-[28px] text-white tracking-wider" style={{ fontFamily: "Lexend_800ExtraBold" }}>{userObj.name || t('seller.unknownSeller')}</Text>
                        {userObj.verified && (
                            <View className="w-6 h-6 items-center justify-center mt-0.5">
                                <BadgeCheck size={22} color="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                            </View>
                        )}
                    </View>
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <Mail size={13} color="#64748B" />
                        <Text className="text-sm text-[#64748B]" style={{ fontFamily: "Lexend_400Regular" }}>{userObj.email}</Text>
                    </View>
                    {userObj.verified && (
                        <View className="flex-row items-center gap-1.5 bg-[#3B82F6]/10 px-3.5 py-1.5 rounded-full border border-[#3B82F6]/20">
                            <Shield size={13} color="#22C55E" />
                            <Text className="text-[#22C55E] text-[13px]" style={{ fontFamily: "Lexend_600SemiBold" }}>
                                {t('seller.verifiedSeller')}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                <Animated.View className="flex-row px-5 gap-2.5 mb-5" style={{ opacity: fadeAnim }}>
                    <View className="flex-1 bg-[#18181B] rounded-[20px] p-3.5 items-center border border-white/[0.05]">
                        <View className="w-9 h-9 rounded-[12px] bg-[#F59E0B]/12 items-center justify-center mb-2">
                            <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        </View>
                        <Text className="text-sm text-white mb-1" style={{ fontFamily: "Lexend_700Bold" }}>{Number(ratingData?.averageRating || 0).toFixed(1)}</Text>
                        <Text className="text-[11px] text-[#64748B] tracking-wider" style={{ fontFamily: "Lexend_400Regular" }}>{ratingData?.totalRatings ?? 0} {t('seller.reviews')}</Text>
                    </View>
                    <View className="flex-1 bg-[#18181B] rounded-[20px] p-3.5 items-center border border-white/[0.05]">
                        <View className="w-9 h-9 rounded-[12px] bg-[#8B5CF6]/12 items-center justify-center mb-2">
                            <Hash size={16} color="#8B5CF6" />
                        </View>
                        <Text className="text-sm text-white mb-1" style={{ fontFamily: "Lexend_700Bold" }}>{userIdNum}</Text>
                        <Text className="text-[11px] text-[#64748B] tracking-wider" style={{ fontFamily: "Lexend_400Regular" }}>{t('seller.userId')}</Text>
                    </View>
                    <View className="flex-1 bg-[#18181B] rounded-[20px] p-3.5 items-center border border-white/[0.05]">
                        <View className="w-9 h-9 rounded-[12px] bg-[#22C55E]/10 items-center justify-center mb-2">
                            <View className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                        </View>
                        <Text className="text-sm mb-1 text-[#22C55E]" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.online')}</Text>
                        <Text className="text-[11px] text-[#64748B] tracking-wider" style={{ fontFamily: "Lexend_400Regular" }}>{t('seller.status')}</Text>
                    </View>
                </Animated.View>

                <Animated.View 
                    className="mx-5 bg-[#18181B] rounded-[24px] p-5 mb-5 border border-white/[0.05]" 
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    <Text className="text-[13px] text-[#64748B] mb-4.5 tracking-wider uppercase" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.information')}</Text>

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center bg-[#3B82F6]/10">
                                <Mail size={14} color="#3B82F6" />
                            </View>
                            <Text className="text-[#94A3B8] text-sm" style={{ fontFamily: "Lexend_500Medium" }}>{t('seller.contactEmail')}</Text>
                        </View>
                        <Text className="text-white text-[13px] flex-1 text-right ml-4" style={{ fontFamily: "Lexend_600SemiBold" }} numberOfLines={1}>{userObj.email}</Text>
                    </View>
                    
                    <View className="h-[1px] bg-white/[0.05] ml-11" />

                    <View className="flex-row justify-between items-center py-2.5">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-[10px] items-center justify-center" style={{ backgroundColor: userObj.verified ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)" }}>
                                <Shield size={14} color={userObj.verified ? "#22C55E" : "#64748B"} />
                            </View>
                            <Text className="text-[#94A3B8] text-sm" style={{ fontFamily: "Lexend_500Medium" }}>{t('seller.trustStatus')}</Text>
                        </View>
                        <View className={[
                            "flex-row items-center gap-1.5 px-2.5 py-1 rounded-[10px] border",
                            userObj.verified ? "bg-[#22C55E]/10 border-[#22C55E]/25" : "bg-[#64748B]/10 border-[#64748B]/25"
                        ].join(" ")}>
                            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: userObj.verified ? "#22C55E" : "#64748B" }} />
                            <Text className="text-[12px]" style={[{ fontFamily: "Lexend_600SemiBold" }, { color: userObj.verified ? "#22C55E" : "#64748B" }]}>
                                {userObj.verified ? t('seller.verifiedDocumented') : t('seller.unverified')}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View className="px-5 gap-2.5" style={{ opacity: fadeAnim }}>
                    <TouchableOpacity
                        className="flex-row items-center justify-between py-[15px] px-[18px] rounded-[20px] shadow-lg bg-[#2563EB]"
                        style={{
                            shadowColor: "#2563EB",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 5,
                        }}
                        onPress={handleContact}
                        disabled={messageMutation.isPending}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-[12px] items-center justify-center bg-white/15">
                                {messageMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <MessageCircle size={18} color="#fff" />
                                )}
                            </View>
                            <Text className="text-white text-base" style={{ fontFamily: "Lexend_700Bold" }}>
                                {messageMutation.isPending ? t('seller.connecting') : `${t('seller.contactPlaceholder')} ${userObj.name?.split(' ')[0] || t('seller.profile')}`}
                            </Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </Animated.View>
                
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
