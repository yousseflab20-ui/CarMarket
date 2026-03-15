import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail, Hash, Shield, Star, MessageCircle, ChevronRight, BadgeCheck } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect } from "react";
import { getSellerRating } from "../service/rating/endpointrating";
import { useQuery, useMutation } from "@tanstack/react-query";
import { message } from "../service/chat/endpoint.message";

const { width } = Dimensions.get("window");

export default function SellerProfile() {
    const { user } = useLocalSearchParams();
    const userObj = user ? JSON.parse(user as string) : null;
    const userIdNum = userObj?.id ? parseInt(userObj.id) : undefined;

    const { data: ratingData } = useQuery({
        queryKey: ["getSellerRating", userIdNum],
        queryFn: () => getSellerRating(userIdNum!),
        enabled: !!userIdNum
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const avatarScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
            Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 8, delay: 150, useNativeDriver: true }),
        ]).start();
    }, []);

    const messageMutation = useMutation({
        mutationFn: (userId: number) => message(userId),
    });

    const handleContact = () => {
        if (!userIdNum) {
            Alert.alert("Error", "Seller information is missing.");
            return;
        }

        messageMutation.mutate(userIdNum, {
            onSuccess: (data: any) => {
                const conversationId = data?.conversation?.id || data?.id || data?.conv?.id;
                if (conversationId) {
                    router.push({
                        pathname: "/ViewMessaageUse",
                        params: {
                            conversationId: conversationId.toString(),
                            otherUserId: userIdNum.toString(),
                            otherUserName: userObj?.name || "Seller",
                            otherUserPhoto: userObj?.photo || "",
                        },
                    });
                } else {
                    Alert.alert("Error", "Failed to retrieve conversation.");
                }
            },
            onError: (err: any) => {
                console.error("❌ Failed to open conversation:", err);
                Alert.alert("Error", "Could not open conversation.");
            },
        });
    };

    if (!userObj) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.text}>Seller data missing.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seller Profile</Text>
                <View style={{ width: 42 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View style={[styles.imageSection, { opacity: fadeAnim, transform: [{ scale: avatarScale }] }]}>
                    <View style={userObj.verified ? styles.gradientBorder : styles.transparentBorder}>
                        <View style={styles.imageWrapper}>
                            {userObj.photo ? (
                                <Image
                                    source={{ uri: userObj.photo }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.imageFallback}>
                                    <Text style={styles.fallbackText}>
                                        {(userObj.name?.[0] || "?").toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    {userObj.verified ? (
                        <View style={styles.badge}>
                            <BadgeCheck size={16} color="#3B82F6" fill="#fff" />
                        </View>
                    ) : null}
                </Animated.View>

                <Animated.View style={[styles.infoHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.nameHeaderRow}>
                        <Text style={styles.name}>{userObj.name || "Unknown Seller"}</Text>
                        {userObj.verified ? (
                            <View style={styles.verifiedBadgeMain}>
                                <BadgeCheck size={22} color="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                            </View>
                        ) : null}
                    </View>
                    <View style={styles.emailContainer}>
                        <Mail size={13} color="#64748B" />
                        <Text style={styles.email}>{userObj.email}</Text>
                    </View>
                    {userObj.verified ? (
                        <View style={styles.levelBadge}>
                            <Shield size={13} color="#22C55E" />
                            <Text style={[styles.levelText, { color: "#22C55E" }]}>
                                Verified Seller
                            </Text>
                        </View>
                    ) : null}
                </Animated.View>

                <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconBox}>
                            <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        </View>
                        <Text style={styles.statValue}>{Number(ratingData?.averageRating || 0).toFixed(1)}</Text>
                        <Text style={styles.statLabel}>{ratingData?.totalRatings ?? 0} reviews</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: "rgba(139, 92, 246, 0.12)" }]}>
                            <Hash size={16} color="#8B5CF6" />
                        </View>
                        <Text style={styles.statValue}>{userIdNum}</Text>
                        <Text style={styles.statLabel}>User ID</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                            <View style={styles.activePulse} />
                        </View>
                        <Text style={[styles.statValue, { color: "#22C55E" }]}>Online</Text>
                        <Text style={styles.statLabel}>Status</Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.infoSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.sectionTitle}>Seller Information</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={[styles.rowIconBox, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
                                <Mail size={14} color="#3B82F6" />
                            </View>
                            <Text style={styles.label}>Contact Email</Text>
                        </View>
                        <Text style={styles.value} numberOfLines={1}>{userObj.email}</Text>
                    </View>
                    
                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={[styles.rowIconBox, { backgroundColor: userObj.verified ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)" }]}>
                                <Shield size={14} color={userObj.verified ? "#22C55E" : "#64748B"} />
                            </View>
                            <Text style={styles.label}>Trust Status</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            userObj.verified ? styles.statusApproved : styles.statusNone
                        ]}>
                            <View style={[styles.activeDot, { backgroundColor: userObj.verified ? "#22C55E" : "#64748B" }]} />
                            <Text style={[styles.statusText, { color: userObj.verified ? "#22C55E" : "#64748B" }]}>
                                {userObj.verified ? 'Verified Documented' : 'Unverified'}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.contactButton]}
                        onPress={handleContact}
                        disabled={messageMutation.isPending}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                {messageMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <MessageCircle size={18} color="#fff" />
                                )}
                            </View>
                            <Text style={styles.buttonText}>
                                {messageMutation.isPending ? "Connecting..." : `Contact ${userObj.name?.split(' ')[0] || "Seller"}`}
                            </Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </Animated.View>
                
                 <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0E14" },
    text: { color: "#fff", fontSize: 16, fontFamily: "Lexend_500Medium" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginBottom: 10,
    },
    headerTitle: { color: "#fff", fontSize: 20, fontFamily: "Lexend_700Bold", letterSpacing: 0.5 },
    backButton: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center", justifyContent: "center",
    },

    scrollContent: { paddingBottom: 48 },

    imageSection: { alignItems: "center", marginBottom: 24 },
    gradientBorder: {
        width: 144, height: 144, borderRadius: 72, padding: 4,
        backgroundColor: "#3B82F6",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5, shadowRadius: 24, elevation: 12,
    },
    transparentBorder: {
        width: 144, height: 144, borderRadius: 72, padding: 4,
        backgroundColor: "transparent",
    },
    imageWrapper: {
        width: "100%", height: "100%", borderRadius: 68,
        overflow: "hidden", backgroundColor: "#1C1F26",
        borderWidth: 3, borderColor: "#0B0E14",
    },
    image: { width: "100%", height: "100%" },
    imageFallback: {
        width: "100%", height: "100%", 
        backgroundColor: "#1E2A3A",
        alignItems: "center", justifyContent: "center"
    },
    fallbackText: {
        color: "#fff", fontSize: 48, fontFamily: "Lexend_700Bold"
    },
    badge: {
        position: "absolute", bottom: 8, right: width / 2 - 84,
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "#0B0E14",
        borderWidth: 2, borderColor: "#3B82F6",
        alignItems: "center", justifyContent: "center",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
    },

    infoHeader: { alignItems: "center", marginBottom: 28, paddingHorizontal: 20 },
    nameHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    name: { fontSize: 28, fontFamily: "Lexend_800ExtraBold", color: "#fff", letterSpacing: 0.5 },
    verifiedBadgeMain: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    emailContainer: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
    email: { fontSize: 14, color: "#64748B", fontFamily: "Lexend_400Regular" },
    levelBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)",
    },
    levelText: { color: "#3B82F6", fontSize: 13, fontFamily: "Lexend_600SemiBold" },

    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20, gap: 10, marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1C1F26",
        borderRadius: 20, padding: 14,
        alignItems: "center",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
    },
    statIconBox: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: "rgba(245, 158, 11, 0.12)",
        alignItems: "center", justifyContent: "center",
        marginBottom: 8,
    },
    activePulse: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: "#22C55E",
    },
    statValue: { fontSize: 14, fontFamily: "Lexend_700Bold", color: "#fff", marginBottom: 3 },
    statLabel: { fontSize: 11, color: "#64748B", letterSpacing: 0.3, fontFamily: "Lexend_400Regular" },

    infoSection: {
        marginHorizontal: 20,
        backgroundColor: "#1C1F26",
        borderRadius: 24, padding: 20,
        marginBottom: 20,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
    },
    sectionTitle: { fontSize: 13, fontFamily: "Lexend_700Bold", color: "#64748B", marginBottom: 18, letterSpacing: 1, textTransform: "uppercase" },
    infoRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", paddingVertical: 11,
    },
    infoLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    rowIconBox: {
        width: 32, height: 32, borderRadius: 10,
        alignItems: "center", justifyContent: "center",
    },
    label: { color: "#94A3B8", fontSize: 14, fontFamily: "Lexend_500Medium" },
    value: {
        color: "#fff", fontSize: 13, fontFamily: "Lexend_600SemiBold",
        flex: 1, textAlign: "right", marginLeft: 16,
    },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginLeft: 44 },
    statusBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
        borderWidth: 1,
    },
    statusApproved: { backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.25)" },
    statusNone: { backgroundColor: "rgba(100,116,139,0.1)", borderColor: "rgba(100,116,139,0.25)" },
    activeDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontFamily: "Lexend_600SemiBold" },

    actionsContainer: { paddingHorizontal: 20, gap: 10 },
    actionButton: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#3B82F6",
        paddingVertical: 15, paddingHorizontal: 18,
        borderRadius: 20,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    contactButton: {
        backgroundColor: "#2563EB",
        shadowColor: "#2563EB",
    },
    actionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    actionIconBox: {
        width: 36, height: 36, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    buttonText: { color: "#fff", fontFamily: "Lexend_700Bold", fontSize: 16 },
});