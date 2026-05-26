import { View, Text, FlatList, TouchableOpacity, Image, StatusBar, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getSellerRating } from "../service/rating/endpointrating";
import { ArrowLeft, Star, MessageSquareOff } from "lucide-react-native";

const C = {
    bg: "#080B12",
    surface: "#0D1117",
    card: "#131929",
    border: "#1E2A3A",
    elevated: "#182030",
    amber: "#F59E0B",
    white: "#F0F6FF",
    muted: "#8B9CB8",
    dim: "#5A6A82",
};

export default function ReviewsScreen() {
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const router = useRouter();
    const sellerId = params.sellerId ? parseInt(params.sellerId as string) : undefined;
    const sellerName = params.sellerName ? (params.sellerName as string) : "Seller";

    const { data: sellerRating, isLoading } = useQuery({
        queryKey: ["getSellerRating", sellerId],
        queryFn: () => getSellerRating(sellerId!),
        enabled: !!sellerId,
    });

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const renderReview = ({ item: review }: { item: any }) => {
        const buyerName = review?.buyer?.name || t('reviews.client');
        const buyerPhoto = review?.buyer?.photo || defaultAvatar;

        return (
            <View className="bg-[#131929] rounded-[16px] p-4 border border-[#1E2A3A] mb-2.5">
                <View className="flex-row items-center mb-2">
                    <Image source={{ uri: buyerPhoto }} className="w-9 h-9 rounded-full mr-2.5 bg-[#182030]" />
                    <View className="flex-1">
                        <Text className="text-[#F0F6FF] text-sm" style={{ fontFamily: "Lexend_600SemiBold" }}>{buyerName}</Text>
                        <Text className="text-[#5A6A82] text-[11px] mt-0.5" style={{ fontFamily: "Lexend_400Regular" }}>
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
                    <Text className="text-[#8B9CB8] text-[13px] leading-5" style={{ fontFamily: "Lexend_400Regular" }}>{review.comment}</Text>
                )}
            </View>
        );
    };

    const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;
    const topPad = statusBarHeight + 12;

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View 
                className="flex-row items-center justify-between px-4 pb-4 border-b border-[#1E2A3A] bg-[#0D1117]" 
                style={{ paddingTop: topPad }}
            >
                <TouchableOpacity onPress={() => router.back()} className="p-1">
                    <ArrowLeft size={24} color={C.white} />
                </TouchableOpacity>
                <Text className="text-[#F0F6FF] text-base" style={{ fontFamily: "Lexend_700Bold" }}>{t('reviews.title', { name: sellerName })}</Text>
                <View className="w-6" />
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center gap-3">
                    <Text className="text-[#8B9CB8] text-sm" style={{ fontFamily: "Lexend_400Regular" }}>{t('reviews.loading')}</Text>
                </View>
            ) : sellerRating?.ratings && sellerRating.ratings.length > 0 ? (
                <FlatList
                    data={sellerRating.ratings}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderReview}
                    contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View className="flex-1 justify-center items-center gap-3">
                    <MessageSquareOff size={48} color={C.dim} strokeWidth={1.5} />
                    <Text className="text-[#5A6A82] text-[15px]" style={{ fontFamily: "Lexend_500Medium" }}>{t('reviews.empty')}</Text>
                </View>
            )}
        </View>
    );
}

