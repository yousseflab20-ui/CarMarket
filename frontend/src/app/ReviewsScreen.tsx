import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar, Platform } from "react-native";
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
            <View style={styles.reviewItemCard}>
                <View style={styles.reviewHeader}>
                    <Image source={{ uri: buyerPhoto }} style={styles.reviewAvatar} />
                    <View style={styles.reviewHeaderContent}>
                        <Text style={styles.reviewBuyerName}>{buyerName}</Text>
                        <Text style={styles.reviewDate}>
                            {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.reviewStars}>
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
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
            </View>
        );
    };

    const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;
    const topPad = statusBarHeight + 12;

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: topPad }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={C.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('reviews.title', { name: sellerName })}</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.centerContent}>
                    <Text style={styles.loadingText}>{t('reviews.loading')}</Text>
                </View>
            ) : sellerRating?.ratings && sellerRating.ratings.length > 0 ? (
                <FlatList
                    data={sellerRating.ratings}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderReview}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContent}>
                    <MessageSquareOff size={48} color={C.dim} strokeWidth={1.5} />
                    <Text style={styles.emptyText}>{t('reviews.empty')}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.bg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: C.surface,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        color: C.white,
        fontSize: 16,
        fontFamily: "Lexend_700Bold",
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        color: C.muted,
        fontSize: 14,
        fontFamily: "Lexend_400Regular",
    },
    emptyText: {
        color: C.dim,
        fontSize: 15,
        fontFamily: "Lexend_500Medium",
    },
    reviewItemCard: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: C.elevated,
    },
    reviewHeaderContent: {
        flex: 1,
    },
    reviewBuyerName: {
        color: C.white,
        fontSize: 14,
        fontFamily: "Lexend_600SemiBold",
    },
    reviewDate: {
        color: C.dim,
        fontSize: 11,
        fontFamily: "Lexend_400Regular",
        marginTop: 2,
    },
    reviewStars: {
        flexDirection: "row",
        gap: 2,
    },
    reviewComment: {
        color: C.muted,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "Lexend_400Regular",
    },
});
