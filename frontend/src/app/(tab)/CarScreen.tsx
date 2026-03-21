import { View, StatusBar, Text, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCarsQuery } from "../../service/car/queries";
import { useEffect, useState } from "react";
import { Search, Heart, Bell, User, Gauge, Users, Clock, LogOut } from 'lucide-react-native';
import { useAuthStore } from "../../store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, getFavorites, removeFavorite } from "../../service/favorite/endpointfavorite";
import { router } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
const BRANDS = [
    { id: 1, name: 'BMW', icon: require("../../assets/image/Bmw.png") },
    { id: 2, name: 'Mercedes', icon: require("../../assets/image/Mercedes.png") },
    { id: 3, name: 'Bentley', icon: require("../../assets/image/Bentley.png") },
    { id: 4, name: 'Audi', icon: require("../../assets/image/Audi.png") },
    { id: 5, name: 'Toyota', icon: require("../../assets/image/Toyota.png") },
];

export default function CarScreen() {
    const { width } = Dimensions.get("window");
    const { user, logout } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrand, setSelectedBrand] = useState('All');

    const queryClient = useQueryClient();
    useFocusEffect(
        useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ["cars"] });
        }, [])
    );

    const { data: cars, isLoading, isError, error } = useCarsQuery();
    console.log("data car", cars)
    const { data: favorites } = useQuery<any, Error>({
        queryKey: ["favorites"],
        queryFn: async () => {
            const res = await getFavorites();
            return res.All;
        },
        enabled: !!user,
    });
    const addFavoriteMutation = useMutation({
        mutationFn: addFavorite,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] })
    });

    const removeFavoriteMutation = useMutation({
        mutationFn: removeFavorite,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] })
    });

    const toggleLike = (carId: number) => {
        const alreadyLiked = favorites?.some((f: any) => f.carId === carId);
        if (alreadyLiked) removeFavoriteMutation.mutate(carId);
        else addFavoriteMutation.mutate(carId);
    };

    const isLiked = (carId: number) => {
        return favorites?.some((f: any) => f.carId === carId);
    };
    const filteredCars = (cars || [])
        .filter((car: any) =>
            (car.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.brand?.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (selectedBrand === 'All' ||
                car.brand?.toLowerCase() === selectedBrand.toLowerCase())
        )
        .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    useEffect(() => {
        if (!user) {
            router.replace("/HomeScreen");
        }
    }, [user]);
    if (isLoading) return <SafeAreaView style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></SafeAreaView>;
    if (isError) return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Error: {error?.message}</Text></SafeAreaView>;
    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.text}>Loading user...</Text>
            </View>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.push({ pathname: "/ProfileUser", params: { user2Id: user.id } })}><Image
                    source={{ uri: user.photo }}
                    style={styles.image}
                    resizeMode="cover"
                /></TouchableOpacity>
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
                    <TextInput placeholder="Search your favorite car" placeholderTextColor="#64748B" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
                </View>
            </View>

            <View style={styles.categoryHeader}><Text style={styles.categoryTitle}>Category</Text></View>
            <View style={styles.brandListContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
                    <TouchableOpacity style={[styles.brandItem, selectedBrand === 'All' && styles.brandItemActive]} onPress={() => setSelectedBrand('All')}>
                        <View style={styles.brandIconContainer}><Text style={styles.brandIconText}>🌟</Text></View>
                        <Text style={styles.brandName}>All</Text>
                    </TouchableOpacity>
                    {BRANDS.map((brand) => (
                        <TouchableOpacity key={brand.id} style={[styles.brandItem, selectedBrand === brand.name && styles.brandItemActive]} onPress={() => setSelectedBrand(brand.name)}>
                            <View style={styles.brandIconContainer}><Image source={brand.icon} style={{ width: 80, height: 60, borderRadius: 20 }} /></View>
                            <Text style={styles.brandName}>{brand.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredCars}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CarCard item={item} width={width} isLiked={isLiked} toggleLike={toggleLike} />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

function CarCard({ item, width, isLiked, toggleLike }: any) {
    const images = item.images && item.images.length > 0 ? item.images : ['https://via.placeholder.com/400x300?text=No+Image'];
    const [activeImg, setActiveImg] = useState(0);
    const cardWidth = width - 40;

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => router.push({
            pathname: '/CarDetailScreen',
            params: {
                car: JSON.stringify(item),
                user: JSON.stringify(item.User || item.user || null),
                user2Id: item.userId?.toString() || "",
            },
        })}>
            <View style={styles.imageWrapper}>
                <FlatList
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
                        setActiveImg(idx);
                    }}
                    keyExtractor={(img, index) => index.toString()}
                    renderItem={({ item: img }) => (
                        <Image
                            source={{ uri: img }}
                            style={[styles.carImage, { width: cardWidth }]}
                            resizeMode="cover"
                        />
                    )}
                />

                {images.length > 1 && (
                    <View style={styles.dotsRow}>
                        {images.map((_: any, i: number) => (
                            <View
                                key={i}
                                style={[styles.dot, i === activeImg && styles.dotActive]}
                            />
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => toggleLike(item.id)}
                >
                    <Heart
                        size={20}
                        color={isLiked(item.id) ? "#EF4444" : "#fff"}
                        fill={isLiked(item.id) ? "#EF4444" : "none"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                    <View><Text style={styles.carName}>{item.title}</Text><Text style={styles.carYear}>{item.year} - {item.brand}</Text></View>
                    <Text style={styles.carPrice}>${item.price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}



const styles = StyleSheet.create({

    text: {
        color: "#fff",
        fontFamily: 'Lexend_400Regular',
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 20
    },
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
        fontFamily: 'Lexend_400Regular',
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
        fontFamily: 'Lexend_500Medium',
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
        fontFamily: 'Lexend_600SemiBold',
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
        fontFamily: 'Lexend_400Regular',
    },
    categoryHeader: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 20,
        fontFamily: 'Lexend_700Bold',
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
        fontFamily: 'Lexend_600SemiBold',
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
    // carImage: {
    //     width: "100%",
    //     height: "100%",
    // },
    carImage: {
        height: "100%",
        borderRadius: 12,
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
    dotsRow: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
        width: 16,
        backgroundColor: '#fff',
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
        fontFamily: 'Lexend_600SemiBold',
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
        fontFamily: 'Lexend_700Bold',
        color: "#fff",
        marginBottom: 4,
    },
    carYear: {
        fontSize: 14,
        color: "#64748B",
        fontFamily: 'Lexend_500Medium',
    },
    carPrice: {
        fontSize: 20,
        fontFamily: 'Lexend_800ExtraBold',
        color: "#fff",
    },
});