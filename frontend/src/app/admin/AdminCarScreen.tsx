import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCar, removeCar } from "../../service/admin/endpoint.Car";
import { Image, HStack } from "native-base";
import { Trash2, Calendar, Car, CreditCard } from "lucide-react-native";

type CarType = {
    id: number;
    title: string;
    photo: string;
    year: number;
    pricePerDay: number;
    brand: string;
    price: string;
};

export default function AdminCarsScreen() {
    const queryClient = useQueryClient();
    const { data: cars } = useQuery<CarType[]>({
        queryKey: ["getAllCar"],
        queryFn: getAllCar
    });
    const RemoveCar = useMutation({
        mutationFn: removeCar,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getAllCar"] })
    })
    const hndeldelete = (CarId: number) => {
        RemoveCar.mutate(CarId)
    }
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Vehicle Inventory</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cars?.length || 0} Cars</Text>
                </View>
            </View>

            <FlatList
                data={cars}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.imageSection}>
                            <Image
                                source={{ uri: item.photo }}
                                alt={item.title}
                                style={styles.carImage}
                                resizeMode="cover"
                            />
                            <View style={styles.brandTag}>
                                <Text style={styles.brandTagText}>{item.brand.toUpperCase()}</Text>
                            </View>
                        </View>
                        <View style={styles.infoSection}>
                            <Text style={styles.carTitle} numberOfLines={1}>{item.title}</Text>

                            <HStack space={3} mt={1} alignItems="center">
                                <HStack space={1} alignItems="center">
                                    <Calendar size={14} color="#94A3B8" />
                                    <Text style={styles.subText}>{item.year}</Text>
                                </HStack>
                                <HStack space={1} alignItems="center">
                                    <Car size={14} color="#94A3B8" />
                                    <Text style={styles.subText}>Automatic</Text>
                                </HStack>
                            </HStack>
                            <View style={styles.priceContainer}>
                                <CreditCard size={16} color="#0056b3" />
                                <Text style={styles.priceText}>{item.price} DH</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7} onPress={() => hndeldelete(item.id)}>
                            <Trash2 size={20} color="#EF4444" />
                        </TouchableOpacity>

                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: "#FFF",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E293B",
    },
    badge: {
        backgroundColor: "#E0E7FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: "#4338CA",
        fontSize: 12,
        fontWeight: "bold",
    },
    listPadding: {
        padding: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 24,
        flexDirection: "row",
        padding: 12,
        marginBottom: 16,
        alignItems: "center",
        elevation: 4,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    imageSection: {
        width: 100,
        height: 110,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "#F8FAFC",
    },
    carImage: {
        width: "100%",
        height: "100%",
    },
    brandTag: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#3182CE",
        paddingVertical: 4,
    },
    brandTagText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
    },
    infoSection: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
    },
    carTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#1E293B",
    },
    subText: {
        fontSize: 13,
        color: "#64748B",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    priceText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#0056b3",
        marginLeft: 6,
    },
    dayText: {
        fontSize: 12,
        color: "#94A3B8",
        marginLeft: 2,
    },
    deleteBtn: {
        backgroundColor: "#FEF2F2",
        padding: 10,
        borderRadius: 14,
        marginLeft: 10,
    },
});