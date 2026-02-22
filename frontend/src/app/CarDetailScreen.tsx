import React, { useState, useRef } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Dimensions,
    FlatList,
    Animated,
    StatusBar,
    Platform,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";

import {
    ArrowLeft,
    Heart,
    Share2,
    MapPin,
    Fuel,
    Users,
    Gauge,
    Clock,
    CheckCircle,
    Phone,
    Star,
    ChevronRight,
    Shield,
    RotateCcw,
    Headphones,
    Car,
} from "lucide-react-native";
import { message } from "../service/chat/endpoint.message";

type CarDetailParams = {
    user: string;
    car: string;
    user2Id: string;
};

const { width: SCREEN_W } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;

const C = {
    bg: "#080B12",
    surface: "#0D1117",
    card: "#131929",
    border: "#1E2A3A",
    elevated: "#182030",
    blue: "#3B82F6",
    blueDark: "#1D4ED8",
    blueGlow: "rgba(59,130,246,0.18)",
    green: "#10B981",
    greenGlow: "rgba(16,185,129,0.15)",
    amber: "#F59E0B",
    red: "#EF4444",
    purple: "#8B5CF6",
    cyan: "#06B6D4",
    white: "#F0F6FF",
    muted: "#8B9CB8",
    dim: "#5A6A82",
    faint: "#2A3A52",
    textDim: "#4A5A72",
};

export default function CarDetailScreen() {
    const { user, car, user2Id } = useLocalSearchParams<CarDetailParams>();
    const queryClient = useQueryClient();
    const scrollY = useRef(new Animated.Value(0)).current;

    const userObj = user ? JSON.parse(user) : null;
    const carObj = car ? JSON.parse(car) : null;
    const user2IdNum = user2Id ? parseInt(user2Id) : undefined;

    if (!carObj) {
        return (
            <View style={styles.errorWrap}>
                <Car size={48} color={C.dim} />
                <Text style={styles.errorText}>Car data missing.</Text>
            </View>
        );
    }

    const [activeImg, setActiveImg] = useState(0);

    const images: string[] = Array.isArray(carObj.images) && carObj.images.length > 0
        ? carObj.images
        : [];

    const messageMutation = useMutation<any, unknown, number>({
        mutationFn: message,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["message"] }),
    });

    const handleMessage = () => {
        if (!user2IdNum) {
            Alert.alert("Error", "Seller information is missing.");
            return;
        }
        messageMutation.mutate(user2IdNum, {
            onSuccess: (data) => {
                const conversationId = data?.conversation?.id || data?.id || data?.conv?.id;
                if (conversationId) {
                    router.push({
                        pathname: "/ViewMessaageUse",
                        params: {
                            conversationId: conversationId.toString(),
                            otherUserId: user2IdNum.toString(),
                        },
                    });
                } else {
                    Alert.alert("Error", "Failed to retrieve conversation.");
                }
            },
            onError: (err) => {
                console.error("❌ Failed to open conversation:", err);
                Alert.alert("Error", "Could not open conversation.");
            },
        });
    };

    const headerBg = scrollY.interpolate({
        inputRange: [IMAGE_HEIGHT - 80, IMAGE_HEIGHT - 20],
        outputRange: ["rgba(8,11,18,0)", "rgba(8,11,18,1)"],
        extrapolate: "clamp",
    });

    const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;
    const topPad = statusBarHeight + 12;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <Animated.View style={[styles.stickyHeader, { backgroundColor: headerBg, paddingTop: topPad }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                    <ArrowLeft size={20} color={C.white} />
                </TouchableOpacity>
                <Text style={styles.stickyTitle} numberOfLines={1}>
                    {carObj.title}
                </Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <Share2 size={18} color={C.white} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                <View style={styles.imageWrap}>
                    {images.length > 0 ? (
                        <FlatList
                            data={images}
                            keyExtractor={(_, i) => i.toString()}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                                setActiveImg(idx);
                            }}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={styles.carImage}
                                    resizeMode="cover"
                                />
                            )}
                        />
                    ) : (
                        <View style={styles.imageFallback}>
                            <View style={styles.imageFallbackIcon}>
                                <Car size={52} color={C.dim} />
                            </View>
                            <Text style={styles.imageFallbackText}>No photos available</Text>
                        </View>
                    )}

                    <View style={styles.imgGradientBottom} pointerEvents="none" />
                    <View style={styles.imgGradientTop} pointerEvents="none" />

                    {images.length > 1 && (
                        <View style={styles.dotsRow}>
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    style={[styles.dot, i === activeImg && styles.dotActive]}
                                />
                            ))}
                        </View>
                    )}

                    <View style={styles.badgesRow}>
                        <View style={[styles.badge, styles.badgeGreen]}>
                            <CheckCircle size={11} color={C.green} />
                            <Text style={[styles.badgeText, { color: C.green }]}>Available Now</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Luxury Edition</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.contentCard}>
                    <View style={styles.handle} />

                    <View style={styles.section}>
                        <Text style={styles.brandTag}>{carObj.brand ?? "Premium Brand"}</Text>
                        <Text style={styles.carTitle}>{carObj.title}</Text>
                        <View style={styles.subtitleRow}>
                            <View style={styles.yearChip}>
                                <Text style={styles.yearChipText}>{carObj.year}</Text>
                            </View>
                            <View style={styles.ratingRow}>
                                <Star size={12} color={C.amber} fill={C.amber} />
                                <Text style={styles.ratingText}>4.8 · 127 reviews</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.specsGrid}>
                        <SpecCard
                            icon={<Gauge size={20} color={C.amber} />}
                            value={carObj.speed ?? 195}
                            unit="mph top"
                            accentColor={C.amber}
                        />
                        <SpecCard
                            icon={<Users size={20} color={C.blue} />}
                            value={carObj.seats ?? 5}
                            unit="seats"
                            accentColor={C.blue}
                        />
                        <SpecCard
                            icon={<Fuel size={20} color={C.green} />}
                            value={(carObj.mileage ?? 0).toLocaleString()}
                            unit="km range"
                            accentColor={C.green}
                        />
                    </View>

                    <Divider />

                    <View style={styles.section}>
                        <SectionHeader title="Listed by" action="View profile →" />
                        <SellerCard user={userObj} />
                    </View>

                    <Divider />

                    <View style={styles.section}>
                        <SectionHeader title="Rental Details" />
                        <View style={styles.rentalRow}>
                            <View style={styles.rentalBox}>
                                <Clock size={22} color={C.blue} />
                                <Text style={styles.rentalLabel}>Daily Rate</Text>
                                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                                    <Text style={styles.rentalValue}>${carObj.pricePerDay}</Text>
                                    <Text style={styles.rentalUnit}>/day</Text>
                                </View>
                            </View>
                            <View style={[styles.rentalBox, styles.rentalBoxGreen]}>
                                <CheckCircle size={22} color={C.green} />
                                <Text style={styles.rentalLabel}>Availability</Text>
                                <Text style={[styles.rentalValue, { color: C.green, fontSize: 14 }]}>
                                    Ready Now
                                </Text>
                            </View>
                        </View>
                        <View style={styles.perksRow}>
                            <PerkChip icon={<Shield size={12} color={C.blue} />} label="Full Insurance" color={C.blue} />
                            <PerkChip icon={<RotateCcw size={12} color={C.muted} />} label="Free Cancel" color={C.muted} />
                            <PerkChip icon={<Headphones size={12} color={C.muted} />} label="24/7 Support" color={C.muted} />
                        </View>
                    </View>

                    <Divider />

                    <View style={styles.section}>
                        <SectionHeader title="Location" action="View Map →" />
                        <TouchableOpacity style={styles.locationCard} activeOpacity={0.7}>
                            <View style={styles.locationIconWrap}>
                                <MapPin size={20} color={C.red} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.locationLabel}>Pickup Point</Text>
                                <Text style={styles.locationName}>
                                    {carObj.location ?? "Casablanca, Morocco"}
                                </Text>
                            </View>
                            <ChevronRight size={18} color={C.faint} />
                        </TouchableOpacity>
                    </View>

                    <Divider />

                    <View style={styles.section}>
                        <SectionHeader title="About this car" />
                        <Text style={styles.aboutText}>{carObj.description ?? "No description available."}</Text>
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </Animated.ScrollView>

            <View style={styles.ctaWrap}>
                <View style={styles.ctaInner}>
                    <View>
                        <Text style={styles.fromLabel}>Starting from</Text>
                        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
                            <Text style={styles.ctaPrice}>${carObj.pricePerDay}</Text>
                            <Text style={styles.ctaPerDay}>/day</Text>
                        </View>
                    </View>
                    <View style={styles.ctaBtns}>
                        <TouchableOpacity
                            style={[styles.messageBtn, messageMutation.isPending && styles.messageBtnLoading]}
                            onPress={handleMessage}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.messageBtnText}>
                                {messageMutation.isPending ? "Opening…" : "💬  Message Seller"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}


function SpecCard({
    icon,
    value,
    unit,
    accentColor,
}: {
    icon: React.ReactNode;
    value: string | number;
    unit: string;
    accentColor: string;
}) {
    return (
        <View style={[styles.specCard, { borderTopColor: accentColor }]}>
            <View style={[styles.specIconWrap, { backgroundColor: accentColor + "18" }]}>
                {icon}
            </View>
            <Text style={styles.specValue}>{value}</Text>
            <Text style={styles.specUnit}>{unit}</Text>
        </View>
    );
}

function SellerCard({ user }: { user: any }) {
    if (!user) return null;
    return (
        <View style={styles.sellerCard}>
            <View style={styles.sellerPhotoWrap}>
                {user.photo ? (
                    <Image source={{ uri: user.photo }} style={styles.sellerPhoto} />
                ) : (
                    <View style={[styles.sellerPhoto, styles.sellerPhotoFallback]}>
                        <Text style={{ color: C.white, fontSize: 22, fontWeight: "700" }}>
                            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.verifiedBadge}>
                    <CheckCircle size={11} color="#fff" fill={C.blue} />
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{user.name ?? "Seller"}</Text>
                <Text style={styles.sellerEmail} numberOfLines={1}>
                    {user.email}
                </Text>
                <View style={styles.sellerStats}>
                    <Star size={11} color={C.amber} fill={C.amber} />
                    <Text style={styles.sellerStatText}>4.9 · 127 trips</Text>
                    <View style={styles.dotSep} />
                    <Text style={styles.sellerStatText}>Member since 2021</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.profileArrow}>
                <ChevronRight size={18} color={C.muted} />
            </TouchableOpacity>
        </View>
    );
}

function SectionHeader({
    title,
    action,
}: {
    title: string;
    action?: string;
}) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {action && <Text style={styles.sectionAction}>{action}</Text>}
        </View>
    );
}

function PerkChip({
    icon,
    label,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    color: string;
}) {
    return (
        <View style={[styles.perkChip, { borderColor: color + "30" }]}>
            {icon}
            <Text style={[styles.perkLabel, { color }]}>{label}</Text>
        </View>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.bg,
    },
    errorWrap: {
        flex: 1,
        backgroundColor: C.bg,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    errorText: { color: C.muted, fontSize: 15 },

    stickyHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    stickyTitle: {
        flex: 1,
        textAlign: "center",
        color: C.white,
        fontSize: 15,
        fontWeight: "700",
        marginHorizontal: 8,
    },

    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    iconBtnLiked: {
        backgroundColor: "rgba(239,68,68,0.22)",
        borderColor: "rgba(239,68,68,0.4)",
    },

    imageWrap: {
        width: SCREEN_W,
        height: IMAGE_HEIGHT,
        backgroundColor: C.card,
        position: "relative",
        overflow: "hidden",
    },
    carImage: {
        width: SCREEN_W,
        height: IMAGE_HEIGHT,
    },
    imageFallback: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.card,
        gap: 12,
    },
    imageFallbackIcon: {
        width: 90,
        height: 90,
        borderRadius: 24,
        backgroundColor: C.elevated,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: "center",
        justifyContent: "center",
    },
    imageFallbackText: {
        color: C.dim,
        fontSize: 13,
        fontWeight: "500",
    },
    imgGradientTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: "transparent",
        opacity: 0.7,
    },
    imgGradientBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: "transparent",
    },
    imgTopRow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    dotsRow: {
        position: "absolute",
        bottom: 56,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    dotActive: {
        width: 20,
        borderRadius: 2.5,
        backgroundColor: "#fff",
    },
    badgesRow: {
        position: "absolute",
        bottom: 20,
        left: 16,
        flexDirection: "row",
        gap: 8,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    badgeGreen: {
        backgroundColor: "rgba(16,185,129,0.15)",
        borderColor: "rgba(16,185,129,0.4)",
    },
    badgeText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 11,
        fontWeight: "600",
    },

    contentCard: {
        backgroundColor: C.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: C.border,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: C.faint,
        alignSelf: "center",
        marginTop: 14,
        marginBottom: 22,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    sectionTitle: {
        color: C.white,
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    sectionAction: {
        color: C.blue,
        fontSize: 12,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginHorizontal: 20,
        marginVertical: 20,
        opacity: 0.6,
    },

    brandTag: {
        color: C.blue,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2.5,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    carTitle: {
        color: C.white,
        fontSize: 28,
        fontWeight: "800",
        lineHeight: 32,
        marginBottom: 10,
    },
    subtitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    yearChip: {
        backgroundColor: C.card,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: C.border,
    },
    yearChipText: {
        color: C.muted,
        fontSize: 12,
        fontWeight: "600",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        color: C.muted,
        fontSize: 12,
        fontWeight: "500",
    },

    specsGrid: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    specCard: {
        flex: 1,
        backgroundColor: C.card,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: "center",
        gap: 6,
        borderTopWidth: 2.5,
        borderWidth: 1,
        borderColor: C.border,
    },
    specIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    specValue: {
        color: C.white,
        fontSize: 18,
        fontWeight: "800",
        marginTop: 2,
    },
    specUnit: {
        color: C.textDim,
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    sellerCard: {
        backgroundColor: C.elevated,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    sellerPhotoWrap: {
        position: "relative",
        flexShrink: 0,
    },
    sellerPhoto: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: C.border,
    },
    sellerPhotoFallback: {
        backgroundColor: C.blueDark,
        alignItems: "center",
        justifyContent: "center",
    },
    verifiedBadge: {
        position: "absolute",
        bottom: -3,
        right: -3,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: C.blue,
        borderWidth: 2,
        borderColor: C.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    sellerName: {
        color: C.white,
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 2,
    },
    sellerEmail: {
        color: C.textDim,
        fontSize: 12,
        marginBottom: 6,
    },
    sellerStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    sellerStatText: {
        color: C.muted,
        fontSize: 11,
        fontWeight: "500",
    },
    dotSep: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: C.faint,
    },
    profileArrow: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: "center",
        justifyContent: "center",
    },

    rentalRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 14,
    },
    rentalBox: {
        flex: 1,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        gap: 6,
    },
    rentalBoxGreen: {
        borderColor: "rgba(16,185,129,0.25)",
        backgroundColor: "rgba(16,185,129,0.06)",
    },
    rentalLabel: {
        color: C.textDim,
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    rentalValue: {
        color: C.white,
        fontSize: 20,
        fontWeight: "800",
    },
    rentalUnit: {
        color: C.textDim,
        fontSize: 12,
        fontWeight: "400",
    },
    perksRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    perkChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: C.card,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    perkLabel: {
        fontSize: 11,
        fontWeight: "600",
    },

    locationCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 16,
        padding: 14,
        gap: 12,
    },
    locationIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(239,68,68,0.1)",
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    locationLabel: {
        color: C.textDim,
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 3,
    },
    locationName: {
        color: C.white,
        fontSize: 14,
        fontWeight: "600",
    },

    aboutText: {
        color: C.muted,
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "400",
    },

    ctaWrap: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: Platform.OS === "ios" ? 30 : 18,
    },
    ctaInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },
    fromLabel: {
        color: C.textDim,
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 2,
    },
    ctaPrice: {
        color: C.white,
        fontSize: 26,
        fontWeight: "800",
    },
    ctaPerDay: {
        color: C.textDim,
        fontSize: 13,
    },
    ctaBtns: {
        flexDirection: "row",
        gap: 10,
        flex: 1,
        justifyContent: "flex-end",
    },
    callBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: "center",
        justifyContent: "center",
    },
    messageBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: C.blue,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: C.blue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 10,
    },
    messageBtnLoading: {
        opacity: 0.7,
    },
    messageBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});