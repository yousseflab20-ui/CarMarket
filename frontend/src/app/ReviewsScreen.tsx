import { View, Text, FlatList, TouchableOpacity, Image, StatusBar, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getSellerRating } from "../service/rating/endpointrating";
import { ArrowLeft, Star, MessageSquareOff } from "lucide-react-native";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ReviewsScreen() {
    const { t } = useTranslation();
    const params = useLocalSearchParams();
    const router = useRouter();
    const sellerId = params.sellerId ? parseInt(params.sellerId as string) : undefined;
    const sellerName = params.sellerName ? (params.sellerName as string) : "Seller";

    const { isDark } = useAppTheme();

    const C = {
        bg: isDark ? "#080B12" : "#F8FAFC",
        surface: isDark ? "#0D1117" : "#FFFFFF",
        card: isDark ? "#131929" : "#FFFFFF",
        border: isDark ? "#1E2A3A" : "#E2E8F0",
        elevated: isDark ? "#182030" : "#F1F5F9",
        amber: "#F59E0B",
        text: isDark ? "#F0F6FF" : "#0F172A",
        muted: isDark ? "#8B9CB8" : "#64748B",
        dim: isDark ? "#5A6A82" : "#94A3B8",
        starEmpty: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    };

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
            <View 
                style={{ 
                    backgroundColor: C.card, 
                    borderRadius: 16, 
                    padding: 16, 
                    borderWidth: 1, 
                    borderColor: C.border, 
                    marginBottom: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Image 
                        source={{ uri: buyerPhoto }} 
                        style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: C.elevated }} 
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontSize: 14, fontFamily: "Lexend_600SemiBold" }}>{buyerName}</Text>
                        <Text style={{ color: C.dim, fontSize: 11, marginTop: 2, fontFamily: "Lexend_400Regular" }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={12}
                                color={s <= review.rating ? C.amber : C.starEmpty}
                                fill={s <= review.rating ? C.amber : "transparent"}
                            />
                        ))}
                    </View>
                </View>
                {!!review.comment && (
                    <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, fontFamily: "Lexend_400Regular" }}>
                        {review.comment}
                    </Text>
                )}
            </View>
        );
    };

    const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;
    const topPad = statusBarHeight + 12;

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.surface} />
            <View 
                style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    paddingHorizontal: 16, 
                    paddingBottom: 16, 
                    borderBottomWidth: 1, 
                    borderColor: C.border, 
                    backgroundColor: C.surface,
                    paddingTop: topPad
                }}
            >
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <ArrowLeft size={24} color={C.text} />
                </TouchableOpacity>
                <Text style={{ color: C.text, fontSize: 16, fontFamily: "Lexend_700Bold" }}>
                    {t('reviews.title', { name: sellerName })}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
                    <Text style={{ color: C.muted, fontSize: 14, fontFamily: "Lexend_400Regular" }}>{t('reviews.loading')}</Text>
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
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
                    <MessageSquareOff size={48} color={C.dim} strokeWidth={1.5} />
                    <Text style={{ color: C.dim, fontSize: 15, fontFamily: "Lexend_500Medium" }}>{t('reviews.empty')}</Text>
                </View>
            )}
        </View>
    );
}
