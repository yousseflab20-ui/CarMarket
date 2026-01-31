import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Trash2, Star } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { getFavorites, removeFavorite } from "../../service/favorite/endpointfavorite";
import { FlatList } from "native-base";
import { getCarImageUrl } from "../../utils/imageHelper";

interface Car {
    id: number;
    title: string;
    brand: string;
    model: string;
    photo: string;
    speed?: number;
    seats?: number;
    pricePerDay?: number;
    price?: number;
}

export default function ProfileUser({ navigation }: any) {
    const { data: favorites = [], isLoading, refetch } = useQuery<Car[]>({
        queryKey: ["favorites"],
        queryFn: async () => {
            const res = await getFavorites();
            return res.All.map((fav: any) => fav.Car);
        },
    });

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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Favorites</Text>
                <View style={{ width: 36 }} />
            </View>
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View>
                        <Text style={styles.emptyText}>No favorite cars yet ❤️</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: getCarImageUrl(item.photo) }} style={styles.image} />
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
                                <Text style={styles.infoText}>🚀 {item.speed || 0} km/h</Text>
                                <Text style={styles.infoText}>💺 {item.seats || 0} seats</Text>
                            </View>

                            <View style={styles.priceRow}>
                                <Text style={styles.priceDay}>
                                    ${item.pricePerDay || 0} / day
                                </Text>
                                <Text style={styles.price}>
                                    ${item.price || 0}
                                </Text>
                            </View>
                        </View>
                    </View>
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
        fontWeight: "700",
    },
    emptyText: {
        color: "#94A3B8",
        textAlign: "center",
        marginTop: 60,
        fontSize: 15,
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
        fontWeight: "700",
    },
    subTitle: {
        color: "#94A3B8",
        marginTop: 4,
        fontSize: 13,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    infoText: {
        color: "#CBD5E1",
        fontSize: 12,
        fontWeight: "600",
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
        fontWeight: "800",
    },
    price: {
        color: "#E5E7EB",
        fontSize: 13,
        fontWeight: "600",
    },
});
