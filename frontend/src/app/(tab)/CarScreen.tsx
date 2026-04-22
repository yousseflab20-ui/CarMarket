import { View, StatusBar, Text, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, Modal, Alert, Share } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useCarsQuery } from "../../service/car/queries";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Search, Heart, Bell, User as UserIcon, Gauge, Users, Clock, LogOut, Edit, SlidersHorizontal, X, Trash2, GitCompare, Share2 } from 'lucide-react-native';
import { useAuthStore } from "../../store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, getFavorites, removeFavorite } from "../../service/favorite/endpointfavorite";
import { router } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { useCompareStore } from "../../store/useCompareStore";
import { Menu, Pressable, Divider, Box, Icon, HStack, VStack } from "native-base";

import { searchCars, deleteCar } from "../../service/car/api";
import { Car } from "../../types/car";
import { Brand, CarFilters, CarCardProps } from "../../types/screens/carScreen";
import { useNotificationStore } from "../../store/notificationStore";
import { createSavedSearch } from "../../service/savedSearch/endpointSavedSearch";
import { MOROCCAN_CITIES } from "../../types/screens/carForm";
import { useToast } from "heroui-native";
import { STATUS_CONFIG } from "../../utils/statusConfig";

const BRANDS: Brand[] = [
    { id: 1, name: 'BMW', icon: require("../../assets/image/Bmw.png") },
    { id: 2, name: 'Mercedes', icon: require("../../assets/image/Mercedes.png") },
    { id: 3, name: 'Bentley', icon: require("../../assets/image/Bentley.png") },
    { id: 4, name: 'Audi', icon: require("../../assets/image/Audi.png") },
    { id: 5, name: 'Toyota', icon: require("../../assets/image/Toyota.png") },
];

const { width, height } = Dimensions.get("window");

export default function CarScreen() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuthStore();
    const insets = useSafeAreaInsets();
    const { cars: compareCars, clearAll, addCar, removeCar } = useCompareStore();
    const pushToken = useNotificationStore((state) => state.pushToken);

    // Local state for search results
    const [filteredData, setFilteredData] = useState<Car[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState<CarFilters>({
        brand: "",
        minPrice: "",
        maxPrice: "",
        city: "",
        year: "",
        transmission: "",
        search: "",
    });

    const queryClient = useQueryClient();
    useFocusEffect(
        useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ["cars"] });
        }, [])
    );

    const { data: cars, isLoading, isError, error } = useCarsQuery();
    const { data: favorites } = useQuery<any[], Error>({
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

    const isLiked = useCallback((carId: number): boolean => {
        return !!favorites?.some((f: any) => f.carId === carId);
    }, [favorites]);

    const filteredCars = useMemo(() => {
        const base = (filteredData || (cars as Car[]) || [])
            .filter((car: Car) =>
                (car.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    car.brand?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                (selectedBrand === 'All' ||
                    car.brand?.toLowerCase() === selectedBrand.toLowerCase())
            )
            .sort((a: Car, b: Car) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        return base;
    }, [filteredData, cars, searchQuery, selectedBrand]);

    const renderCarItem = useCallback(({ item }: { item: Car }) => (
        <CarCard
            item={item}
            width={width}
            isLiked={isLiked}
            toggleLike={toggleLike}
            user={user}
            onDelete={(id) => deleteMutation.mutate(id)}
        />
    ), [width, isLiked, toggleLike, user]);

    useEffect(() => {
        if (!user) {
            router.replace("/HomeScreen");
        }
    }, [user]);

    const buildQuery = () => {
        const params = new URLSearchParams();
        if (selectedBrand && selectedBrand !== 'All') params.append("brand", selectedBrand);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.year) params.append("year", filters.year);
        if (filters.city) params.append("city", filters.city);
        if (filters.transmission) params.append("transmission", filters.transmission);
        if (searchQuery) params.append("search", searchQuery);
        return params.toString();
    };

    const deleteMutation = useMutation({
        mutationFn: deleteCar,
        onSuccess: () => {
            toast.show({
                variant: "success",
                label: "Deleted",
                description: "Car deleted successfully",
                actionLabel: "Close",
                onActionPress: ({ hide }) => hide(),
            });
            queryClient.invalidateQueries({ queryKey: ["cars"] });
        },
        onError: () => {
            toast.show({
                variant: "danger",
                label: "Error",
                description: "Failed to delete",
                actionLabel: "Close",
                onActionPress: ({ hide }) => hide(),
            });
        },
    });

    const applySearch = async () => {
        setIsSearching(true);
        try {
            const query = buildQuery();
            const results = await searchCars(query);
            const data = Array.isArray(results) ? results : (results?.data ?? []);
            setFilteredData(data);
            await createSavedSearch({
                pushToken: pushToken,
                brand: selectedBrand !== "All" ? selectedBrand : filters.brand || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                city: filters.city || undefined,
                year: filters.year || undefined,
                transmission: filters.transmission || undefined,
                search: searchQuery || filters.search || undefined,
            });
            setIsFilterVisible(false);
        } catch (err) {
            console.error("Filter error: ", err);
        } finally {
            setIsSearching(false);
        }
    };

    if (isLoading) return <SafeAreaView style={styles.loadingContainer}><Text style={styles.loadingText}>{t('carScreen.loading')}</Text></SafeAreaView>;
    if (isError) return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>{t('carScreen.error')}: {error?.message}</Text></SafeAreaView>;
    if (!user) return <View style={styles.loadingContainer}><Text style={styles.text}>{t('carScreen.loadingUser')}</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.push({ pathname: "/ProfileUser", params: { user2Id: user.id } })}>
                    <Image source={{ uri: user.photo }} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}><Text style={styles.searchTitle}>{t('carScreen.searchHeader')}</Text></View>
                <TouchableOpacity style={styles.iconButton}><Bell size={24} color="#fff" /><View style={styles.activeDot} /></TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#94A3B8" />
                    <TextInput placeholder={t('carScreen.searchPlaceholder')} placeholderTextColor="#64748B" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
                    <TouchableOpacity onPress={() => setIsFilterVisible(true)} style={styles.filterIconButton}><SlidersHorizontal size={20} color="#3B82F6" /></TouchableOpacity>
                </View>
            </View>

            <View style={styles.categoryHeader}><Text style={styles.categoryTitle}>{t('carScreen.category')}</Text></View>
            <View style={styles.brandListContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
                    <TouchableOpacity style={[styles.brandItem, selectedBrand === 'All' && styles.brandItemActive]} onPress={() => setSelectedBrand('All')}>
                        <View style={styles.brandIconContainer}><Text style={styles.brandIconText}>🌟</Text></View>
                        <Text style={styles.brandName}>{t('carScreen.all')}</Text>
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
                renderItem={renderCarItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={false}
                initialNumToRender={6}
                maxToRenderPerBatch={10}
                windowSize={5}
            />

            {compareCars.length > 0 && (
                <View style={[styles.compareBar, { bottom: insets.bottom + 68 }]}>
                    <View style={styles.compareBarInfo}>
                        <View style={styles.compareCountBadge}><GitCompare size={14} color="#fff" /></View>
                        <Text style={styles.compareBarText}>{compareCars.length} {t('carScreen.carsSelected')}</Text>
                    </View>
                    <TouchableOpacity style={styles.compareBarBtn} onPress={() => router.push('/CompareScreen')}><Text style={styles.compareBarBtnText}>{t('carScreen.compareNow')}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.clearAllBtn} onPress={clearAll}><X size={18} color="#94A3B8" /></TouchableOpacity>
                </View>
            )}

            <Modal visible={isFilterVisible} animationType="slide" transparent={true} onRequestClose={() => setIsFilterVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{t('carScreen.filters')}</Text>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)} style={styles.closeIconBtn}><X size={24} color="#94A3B8" /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                            <Text style={styles.filterLabel}>{t('carScreen.priceRange')}</Text>
                            <View style={styles.row}>
                                <TextInput style={styles.filterInput} placeholder={t('carScreen.minPrice')} placeholderTextColor="#64748B" keyboardType="numeric" value={filters.minPrice} onChangeText={(text) => setFilters({ ...filters, minPrice: text })} />
                                <View style={styles.dash} />
                                <TextInput style={styles.filterInput} placeholder={t('carScreen.maxPrice')} placeholderTextColor="#64748B" keyboardType="numeric" value={filters.maxPrice} onChangeText={(text) => setFilters({ ...filters, maxPrice: text })} />
                            </View>
                            <Text style={styles.filterLabel}>{t('carScreen.modelYear')}</Text>
                            <TextInput style={styles.filterInputFull} placeholder={t('carScreen.yearPlaceholder')} placeholderTextColor="#64748B" keyboardType="numeric" value={filters.year} onChangeText={(text) => setFilters({ ...filters, year: text })} />
                            <Text style={styles.filterLabel}>{t('carScreen.transmission')}</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.filterBtn, filters.transmission === 'Automatic' && styles.filterBtnActive]} onPress={() => setFilters({ ...filters, transmission: filters.transmission === 'Automatic' ? "" : 'Automatic' })}><Text style={[styles.filterBtnText, filters.transmission === 'Automatic' && { color: '#3B82F6' }]}>{t('carScreen.automatic')}</Text></TouchableOpacity>
                                <TouchableOpacity style={[styles.filterBtn, filters.transmission === 'Manual' && styles.filterBtnActive]} onPress={() => setFilters({ ...filters, transmission: filters.transmission === 'Manual' ? "" : 'Manual' })}><Text style={[styles.filterBtnText, filters.transmission === 'Manual' && { color: '#3B82F6' }]}>{t('carScreen.manual')}</Text></TouchableOpacity>
                            </View>
                            <Text style={styles.filterLabel}>{t('carScreen.city')}</Text>
                            <View style={styles.citiesWrapper}>
                                {['All', ...MOROCCAN_CITIES].map((c, i) => (
                                    <TouchableOpacity key={i} style={[styles.cityBadge, filters.city === c && styles.cityBadgeActive]} onPress={() => setFilters({ ...filters, city: filters.city === c ? "" : c })}><Text style={[styles.cityBadgeText, filters.city === c && { color: '#3B82F6' }]}>{t(`carScreen.cities.${c.toLowerCase()}`)}</Text></TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={styles.applyBtnWrapper}><TouchableOpacity style={styles.applyBtn} onPress={applySearch} disabled={isSearching}><Text style={styles.applyBtnText}>{isSearching ? t('carScreen.searching') : t('carScreen.showVehicles')}</Text></TouchableOpacity></View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function CarCardComponent({ item, width, isLiked, toggleLike, user, onDelete }: CarCardProps) {
    const { t } = useTranslation();
    const { cars: compareCars, addCar, removeCar } = useCompareStore();
    const isSelected = useMemo(() => compareCars.some(c => c.id === item.id), [compareCars, item.id]);
    const isFull = useMemo(() => compareCars.length >= 3 && !isSelected, [compareCars, isSelected]);

    const onCompareSelect = useCallback(() => {
        if (isSelected) removeCar(item.id);
        else if (!isFull) addCar(item);
    }, [isSelected, isFull, item, addCar, removeCar]);

    const images = item.images && item.images.length > 0 ? item.images : ['https://via.placeholder.com/400x300?text=No+Image'];
    const [activeImg, setActiveImg] = useState(0);
    const cardWidth = width - 40;
    const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.available;
    const liked = isLiked(item.id);

    const handleShare = async () => {
        if (!item?.id) return;
        try {
            await Share.share({
                message: `Check out this ${item.year || ''} ${item.brand || ''} ${item.title || ''} on CarMarket! Price: $${item.price || 0}`,
                url: `https://carmarket.com/cars/${item.id}`,
            });
        } catch (error) { console.error("Error sharing:", error); }
    };

    return (
        <TouchableOpacity style={[styles.card, isSelected && styles.cardSelected]} activeOpacity={0.9} onPress={() => router.push({ pathname: '/CarDetailScreen', params: { car: JSON.stringify(item), user: JSON.stringify(item.User || item.user || null), user2Id: item.userId?.toString() || "" } })}>
            <View style={styles.imageWrapper}>
                <FlatList data={images} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.x / cardWidth); setActiveImg(idx); }} keyExtractor={(img, index) => index.toString()} renderItem={({ item: img }) => (<Image source={{ uri: img }} style={[styles.carImage, { width: cardWidth }]} resizeMode="cover" />)} />
                {images.length > 1 && (<View style={styles.dotsRow}>{images.map((_: any, i: number) => (<View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />))}</View>)}
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}><Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text></View>
                <View style={styles.menuTriggerContainer}>
                    <Menu
                        trigger={(triggerProps) => (
                            <Pressable
                                {...triggerProps}
                                style={styles.menuTrigger}
                                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                            >
                                <View style={styles.menuDot} />
                                <View style={[styles.menuDot, styles.menuDotMid]} />
                                <View style={styles.menuDot} />
                            </Pressable>
                        )}
                        placement="bottom right"
                        offset={10}
                        bg="#0C1018"
                        borderColor="rgba(255,255,255,0.1)"
                        borderWidth={1}
                        rounded="2xl"
                        shadow={9}
                        w={240}
                    >
                        {/* Panel header */}
                        <Box px={4} pt={3} pb={2}>
                            <Text style={styles.menuPanelLabel}>Quick Actions</Text>
                        </Box>
                        <Divider bg="rgba(255,255,255,0.05)" thickness="1" />

                        {/* Favorite */}
                        <Menu.Item onPress={() => toggleLike(item.id)} py={3} px={4}>
                            <HStack alignItems="center" space={3}>
                                <View style={[styles.menuIconCircle, liked && styles.menuIconCircleRed]}>
                                    <Heart size={16} color={liked ? "#EF4444" : "#94A3B8"} fill={liked ? "#EF4444" : "none"} />
                                </View>
                                <VStack flex={1}>
                                    <Text style={[styles.menuItemTitle, liked && { color: "#F87171" }]}>
                                        {liked ? t('menu.unfavorite') : t('menu.favorite')}
                                    </Text>
                                    <Text style={styles.menuItemSub}>
                                        {liked ? 'Tap to unsave' : 'Save for later'}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Menu.Item>

                        {/* Compare */}
                        <Menu.Item onPress={onCompareSelect} disabled={isFull} py={3} px={4}>
                            <HStack alignItems="center" space={3} opacity={isFull ? 0.3 : 1}>
                                <View style={[styles.menuIconCircle, isSelected && styles.menuIconCircleBlue]}>
                                    <GitCompare size={16} color={isSelected ? "#60A5FA" : "#94A3B8"} />
                                </View>
                                <VStack flex={1}>
                                    <Text style={[styles.menuItemTitle, isSelected && { color: "#60A5FA" }]}>
                                        {isSelected ? t('menu.removeFromCompare') : t('menu.compare')}
                                    </Text>
                                    <Text style={styles.menuItemSub}>
                                        {isFull ? 'Max 3 cars reached' : isSelected ? 'In compare list' : 'Side-by-side compare'}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Menu.Item>

                        {/* Owner-only section */}
                        {Number(user?.id) === Number(item.userId || item.user?.id || item.User?.id) && (
                            <>
                                <Divider bg="rgba(255,255,255,0.05)" thickness="1" my={1} />
                                <Box px={4} py={2}>
                                    <Text style={styles.menuSectionLabel}>Your Listing</Text>
                                </Box>
                                <Menu.Item onPress={() => onDelete?.(item.id)} py={3} px={4}>
                                    <HStack alignItems="center" space={3}>
                                        <View style={styles.menuIconCircleRed}>
                                            <Trash2 size={16} color="#F87171" />
                                        </View>
                                        <VStack flex={1}>
                                            <Text style={[styles.menuItemTitle, { color: "#F87171" }]}>{t('menu.delete')}</Text>
                                            <Text style={[styles.menuItemSub, { color: 'rgba(248,113,113,0.5)' }]}>Permanently remove</Text>
                                        </VStack>
                                    </HStack>
                                </Menu.Item>
                            </>
                        )}
                    </Menu>
                </View>

                <View style={styles.pillsContainer}>
                    {liked && (
                        <View style={styles.pill}>
                            <Heart size={12} color="#EF4444" fill="#EF4444" />
                        </View>
                    )}
                    {isSelected && (
                        <View style={[styles.pill, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <GitCompare size={12} color="#3B82F6" />
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.cardContent}><View style={styles.cardHeaderRow}><View><Text style={styles.carName}>{item.title}</Text><Text style={styles.carYear}>{item.year} - {item.brand}</Text></View><Text style={styles.carPrice}>${item.price}</Text></View></View>
        </TouchableOpacity>
    );
}

function CarCard(props: CarCardProps) {
    return <CarCardComponent {...props} />;
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
    filterIconButton: {
        padding: 8,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.2)",
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
        borderWidth: 2,
        borderColor: 'transparent',
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
    manageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2D3545",
        paddingVertical: 12,
        borderRadius: 16,
        marginTop: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: "#3B82F6",
    },
    manageButtonText: {
        color: "#E2E8F0",
        fontSize: 14,
        fontFamily: 'Lexend_600SemiBold',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: "#161921",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 24,
        maxHeight: height * 0.85,
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    sheetTitle: {
        color: "#fff",
        fontSize: 22,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.5,
    },
    closeIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
    },
    filterLabel: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Lexend_600SemiBold",
        marginBottom: 14,
        marginTop: 24,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    filterInput: {
        flex: 1,
        backgroundColor: "#0B0E14",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        color: "#fff",
        fontFamily: "Lexend_500Medium",
        fontSize: 15,
    },
    filterInputFull: {
        width: "100%",
        backgroundColor: "#0B0E14",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        color: "#fff",
        fontFamily: "Lexend_500Medium",
        fontSize: 15,
    },
    dash: {
        width: 14,
        height: 2,
        backgroundColor: "#64748B",
        marginHorizontal: 12,
        borderRadius: 2,
    },
    filterBtn: {
        flex: 1,
        backgroundColor: "#0B0E14",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        marginHorizontal: 6,
    },
    filterBtnActive: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.4)",
    },
    filterBtnText: {
        color: "#94A3B8",
        fontFamily: "Lexend_600SemiBold",
        fontSize: 15,
    },
    citiesWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    cityBadge: {
        backgroundColor: "#0B0E14",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    cityBadgeActive: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.4)",
    },
    cityBadgeText: {
        color: "#94A3B8",
        fontFamily: "Lexend_500Medium",
        fontSize: 14,
    },
    applyBtnWrapper: {
        borderTopWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingTop: 16,
        paddingBottom: 28,
        marginTop: 10,
    },
    applyBtn: {
        backgroundColor: "#3B82F6",
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    applyBtnText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.5,
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 10,
    },
    statusAvailable: {
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
    },
    statusSold: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
    },
    statusReserved: {
        backgroundColor: 'rgba(234, 179, 8, 0.9)',
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Lexend_700Bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    menuTriggerContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 20,
    },
    menuTrigger: {
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: 'rgba(8, 11, 18, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3.5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        flexDirection: 'column',
        // Subtle inner glow on the border
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    menuDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    menuDotMid: {
        // Slightly larger middle dot for visual rhythm
        width: 4,
        height: 4,
        opacity: 0.7,
    },
    menuPanelLabel: {
        color: 'rgba(148,163,184,0.5)',
        fontSize: 10,
        fontFamily: 'Lexend_600SemiBold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    menuSectionLabel: {
        color: 'rgba(248,113,113,0.5)',
        fontSize: 10,
        fontFamily: 'Lexend_600SemiBold',
        letterSpacing: 1.0,
        textTransform: 'uppercase',
    },
    menuIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    menuIconCircleBlue: {
        backgroundColor: 'rgba(59,130,246,0.15)',
        borderColor: 'rgba(59,130,246,0.25)',
    },
    menuIconCircleRed: {
        backgroundColor: 'rgba(248,113,113,0.12)',
        borderColor: 'rgba(248,113,113,0.2)',
    },
    // Legacy kept for compatibility
    menuIconBg: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconBgBlue: {
        backgroundColor: 'rgba(59,130,246,0.15)',
    },
    menuIconBgRed: {
        backgroundColor: 'rgba(239,68,68,0.12)',
    },
    menuItemTitle: {
        color: '#E2E8F0',
        fontSize: 14,
        fontFamily: 'Lexend_600SemiBold',
    },
    menuItemSub: {
        color: 'rgba(148,163,184,0.55)',
        fontSize: 11,
        fontFamily: 'Lexend_400Regular',
        marginTop: 2,
    },
    menuItemText: {
        color: '#E2E8F0',
        fontSize: 14,
        fontFamily: 'Lexend_500Medium',
    },
    cardSelected: {
        borderColor: '#3B82F6',
        borderWidth: 2,
    },
    compareBar: {
        position: 'absolute',
        bottom: 88, // fallback — overridden inline with insets.bottom + 68
        left: 20,
        right: 20,
        backgroundColor: '#1E293B',
        height: 70,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    compareBarInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    compareCountBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    compareBarText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Lexend_600SemiBold',
    },
    compareBarBtn: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        marginRight: 12,
    },
    compareBarBtnText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Lexend_700Bold',
    },
    clearAllBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});