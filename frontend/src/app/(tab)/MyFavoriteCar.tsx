import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Trash2, Star } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavorites, removeFavorite } from "../../service/favorite/endpointfavorite";
import { useFocusEffect, router } from "expo-router";
import { useCallback } from "react";
import { FavoriteCar } from "../../types/screens/favorite";




export default function MyFavoriteCar() {
    const { t } = useTranslation();
    const { data: favorites = [], isLoading, refetch } = useQuery<FavoriteCar[]>({
        queryKey: ["favorites"],
        queryFn: async () => {
            const res = await getFavorites();
            return res.All.map((fav: any) => fav.Car);
        },
    });

    const queryClient = useQueryClient();
    console.log("log favorite", favorites);
    useFocusEffect(
        useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        }, [])
    );
    const handleRemove = async (carId: number) => {
        try {
            await removeFavorite(carId);
            refetch();
        } catch (err) {
            console.log("Failed to remove favorite:", err);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn}>
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
                <View style={{ width: 36 }} />
            </View>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View>
                        <Text style={styles.emptyText}>{t('favorites.noFavorites')}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => router.push({
                            pathname: '/CarDetailScreen',
                            params: {
                                car: JSON.stringify(item),
                                user: JSON.stringify(item.User || item.user || null),
                                user2Id: item.userId?.toString() || "",
                            },
                        })}
                    >
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: item?.images?.[0] }}
                                style={styles.image}
                            />

                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => handleRemove(item.id)}
                            >
                                <Trash2 size={18} color="#fff" fill="#EF4444" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Star size={18} color="#FACC15" fill="#FACC15" />
                            </View>

                            <Text style={styles.subTitle}>
                                {item.brand} • {item.model}
                            </Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoText}>🚀 {item.speed || 0} {t('car.kmh')}</Text>
                                <Text style={styles.infoText}>💺 {item.seats || 0} {t('car.seats')}</Text>
                            </View>

                            <View style={styles.priceRow}>
                                <Text style={styles.priceDay}>
                                    {item.pricePerDay || 0} DH / {t('car.day')}
                                </Text>
                                <Text style={styles.price}>
                                    {item.price || 0} DH
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14",
    },
    loader: {
        flex: 1,
        backgroundColor: "#0B0E14",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: {
        backgroundColor: "#1C1F26",
        padding: 8,
        borderRadius: 12,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Lexend_700Bold",
    },
    emptyText: {
        color: "#94A3B8",
        textAlign: "center",
        marginTop: 60,
        fontSize: 15,
        fontFamily: "Lexend_400Regular",
    },
    card: {
        backgroundColor: "#1C1F26",
        borderRadius: 18,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2D3545",
    },
    imageWrapper: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 190,
    },
    removeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#EF4444",
        padding: 8,
        borderRadius: 999,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    cardBody: {
        padding: 14,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Lexend_700Bold",
    },
    subTitle: {
        color: "#94A3B8",
        marginTop: 4,
        fontSize: 13,
        fontFamily: "Lexend_400Regular",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    infoText: {
        color: "#CBD5E1",
        fontSize: 12,
        fontFamily: "Lexend_600SemiBold",
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 14,
    },
    priceDay: {
        color: "#3B82F6",
        fontSize: 15,
        fontFamily: "Lexend_800ExtraBold",
    },
    price: {
        color: "#E5E7EB",
        fontSize: 13,
        fontFamily: "Lexend_600SemiBold",
    },
});