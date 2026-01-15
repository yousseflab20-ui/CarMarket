import { View, StatusBar, Text, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { AllCar } from "../../service/endpointService";
import { useState } from "react";
import { Search, Heart, Bell, User, Gauge, Users, Clock } from 'lucide-react-native';

const BRANDS = [
    { id: 1, name: 'BMW', icon: require("../../assets/image/Bmw.png") },
    { id: 2, name: 'Mercedes', icon: require("../../assets/image/Mercedes.png") },
    { id: 3, name: 'Bentley', icon: require("../../assets/image/Bentley.png") },
    { id: 4, name: 'Audi', icon: require("../../assets/image/Audi.png") },
    { id: 5, name: 'Toyota', icon: require("../../assets/image/Toyota.png") },
];

export default function CarScreen({ navigation }: any) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [liked, setLiked] = useState<{ [key: number]: boolean }>({});

    const { data: cars, isLoading, isError, error } = useQuery({
        queryKey: ["cars"],
        queryFn: AllCar,
    });

    const filteredCars = cars?.filter((car: { title: string; brand: string; }) =>
        (car.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            car.brand?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedBrand === 'All' || car.brand?.toLowerCase() === selectedBrand.toLowerCase())
    ) || [];

    const toggleLike = (carId: number) => {
        setLiked(prev => ({
            ...prev,
            [carId]: !prev[carId]
        }));
    };

    if (isLoading) return (
        <SafeAreaView style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
    );

    if (isError) return (
        <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error?.message}</Text>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton}>
                    <User size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.searchTitle}>Search for a Car...</Text>
                </View>
                <TouchableOpacity style={styles.iconButton}>
                    <Bell size={24} color="#fff" />
                    <View style={styles.activeDot} />
                </TouchableOpacity>
            </View>
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        placeholder="Search your favorite car"
                        placeholderTextColor="#64748B"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>
            <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Category</Text>
            </View>
            <View style={styles.brandListContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
                    <TouchableOpacity
                        style={[styles.brandItem, selectedBrand === 'All' && styles.brandItemActive]}
                        onPress={() => setSelectedBrand('All')}
                    >
                        <View style={styles.brandIconContainer}>
                            <Text style={styles.brandIconText}>🌟</Text>
                        </View>
                        <Text style={styles.brandName}>All</Text>
                    </TouchableOpacity>
                    {BRANDS.map((brand) => (
                        <TouchableOpacity
                            key={brand.id}
                            style={[styles.brandItem, selectedBrand === brand.name && styles.brandItemActive]}
                            onPress={() => setSelectedBrand(brand.name)}
                        >
                            <View style={styles.brandIconContainer}>
                                <Image source={brand.icon} style={{ width: 80, height: 60, borderRadius: 20 }} />
                            </View>
                            <Text style={styles.brandName}>{brand.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <FlatList
                data={filteredCars}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('CarDetailScreen', { car: item })}
                    >
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: item.photo }}
                                style={styles.carImage}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.likeButton}
                                onPress={() => toggleLike(item.id)}
                            >
                                <Heart
                                    size={20}
                                    color={liked[item.id] ? "#EF4444" : "#fff"}
                                    fill={liked[item.id] ? "#EF4444" : "none"}
                                />
                            </TouchableOpacity>
                            <View style={styles.pillsContainer}>
                                <View style={styles.pill}>
                                    <Gauge size={14} color="#fff" style={styles.pillIcon} />
                                    <Text style={styles.pillText}>{item.speed} mph</Text>
                                </View>
                                <View style={styles.pill}>
                                    <Users size={14} color="#fff" style={styles.pillIcon} />
                                    <Text style={styles.pillText}>{item.seats} seats</Text>
                                </View>
                                <View style={styles.pill}>
                                    <Clock size={14} color="#fff" style={styles.pillIcon} />
                                    <Text style={styles.pillText}>${item.pricePerDay} /Day</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.cardHeaderRow}>
                                <View>
                                    <Text style={styles.carName}>{item.title}</Text>
                                    <Text style={styles.carYear}>{item.year} - {item.brand}</Text>
                                </View>
                                <Text style={styles.carPrice}>${item.price}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B0E14",
    },
    loadingText: {
        fontSize: 16,
        color: "#94A3B8",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B0E14",
    },
    errorText: {
        fontSize: 16,
        color: "#EF4444",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1C1F26",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    activeDot: {
        position: "absolute",
        top: 12,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#EF4444",
        borderWidth: 1.5,
        borderColor: "#1C1F26",
    },
    headerTextContainer: {
        flex: 1,
        alignItems: "center",
    },
    searchTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        opacity: 0.9,
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1C1F26",
        height: 54,
        borderRadius: 16,
        paddingHorizontal: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
    },
    categoryHeader: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    brandListContainer: {
        marginBottom: 24,
    },
    brandList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    brandItem: {
        width: 100,
        height: 110,
        backgroundColor: "#1C1F26",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    brandItemActive: {
        backgroundColor: "#2D3545",
        borderWidth: 1,
        borderColor: "#3B82F6",
    },
    brandIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    brandIconText: {
        fontSize: 24,
    },
    brandName: {
        color: "#94A3B8",
        fontSize: 13,
        fontWeight: "600",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#1C1F26",
        borderRadius: 28,
        marginBottom: 20,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    imageWrapper: {
        height: 200,
        position: "relative",
    },
    carImage: {
        width: "100%",
        height: "100%",
    },
    likeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    pillsContainer: {
        position: "absolute",
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(28, 31, 38, 0.85)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    pillIcon: {
        opacity: 0.8,
    },
    pillText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    cardContent: {
        padding: 20,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    carName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    carYear: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "500",
    },
    carPrice: {
        fontSize: 20,
        fontWeight: "800",
        color: "#fff",
    },
});
