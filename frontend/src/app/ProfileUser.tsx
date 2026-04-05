import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Alert } from "react-native";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ArrowLeft, Mail, Hash, Shield, Star, MessageCircle, Heart, ChevronRight, BadgeCheck, TrendingUp, Settings } from "lucide-react-native";
import { router } from "expo-router";
import { useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getSellerRating } from "../service/rating/endpointrating"
import { useQuery } from "@tanstack/react-query";
import { User } from "../types/user";
import { SellerRatingResponse } from "../types/rating";
import { AuthState } from "../types/store/auth";


const { width } = Dimensions.get("window");

export default function ProfileUser() {

    const { user, logout, refreshProfile } = useAuthStore() as AuthState;

    const userIdNum = user?.id ? Number(user.id) : undefined;


    const { data: ratingData } = useQuery<SellerRatingResponse, Error>({
        queryKey: ["getSellerRating", userIdNum],
        queryFn: () => getSellerRating(userIdNum!),
        enabled: !!userIdNum
    })

    console.log("log profile", ratingData)
    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [])
    );

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

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.text}>Loading user...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={logout}
                >
                    <LogOut size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View style={[styles.imageSection, { opacity: fadeAnim, transform: [{ scale: avatarScale }] }]}>
                    <View style={styles.gradientBorder}>
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: user.photo }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                    <View style={styles.badge}>
                        <Star size={11} color="#fff" fill="#fff" />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.infoHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.nameHeaderRow}>
                        <Text style={styles.name}>{user.name}</Text>
                        {user.verificationStatus === 'approved' && (
                            <View style={styles.verifiedBadgeMain}>
                                <BadgeCheck size={22} color="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                            </View>
                        )}
                    </View>
                    <View style={styles.emailContainer}>
                        <Mail size={13} color="#64748B" />
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                    <View style={styles.levelBadge}>
                        <Shield size={13} color={user.verificationStatus === 'approved' ? "#22C55E" : "#3B82F6"} />
                        <Text style={[styles.levelText, user.verificationStatus === 'approved' && { color: "#22C55E" }]}>
                            {user.verificationStatus === 'approved' ? "Verified Seller" : "Premium Member"}
                        </Text>
                    </View>
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
                        <Text style={styles.statValue}>{user.id}</Text>
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
                    <Text style={styles.sectionTitle}>Account Details</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={[styles.rowIconBox, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
                                <Mail size={14} color="#3B82F6" />
                            </View>
                            <Text style={styles.label}>Email</Text>
                        </View>
                        <Text style={styles.value} numberOfLines={1}>{user.email}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={[styles.rowIconBox, { backgroundColor: "rgba(139, 92, 246, 0.1)" }]}>
                                <Hash size={14} color="#8B5CF6" />
                            </View>
                            <Text style={styles.label}>User ID</Text>
                        </View>
                        <Text style={styles.value}>{user.id}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={[styles.rowIconBox, {
                                backgroundColor:
                                    user.verificationStatus === 'approved' ? "rgba(34,197,94,0.1)" :
                                        user.verificationStatus === 'pending' ? "rgba(245,158,11,0.1)" :
                                            user.verificationStatus === 'rejected' ? "rgba(239,68,68,0.1)" :
                                                "rgba(100,116,139,0.1)"
                            }]}>
                                <Shield size={14} color={
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                "#64748B"
                                } />
                            </View>
                            <Text style={styles.label}>Verification</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            user.verificationStatus === 'approved' ? styles.statusApproved :
                                user.verificationStatus === 'pending' ? styles.statusPending :
                                    user.verificationStatus === 'rejected' ? styles.statusRejected :
                                        styles.statusNone
                        ]}>
                            <View style={[styles.activeDot, {
                                backgroundColor:
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                "#64748B"
                            }]} />
                            <Text style={[styles.statusText, {
                                color:
                                    user.verificationStatus === 'approved' ? "#22C55E" :
                                        user.verificationStatus === 'pending' ? "#F59E0B" :
                                            user.verificationStatus === 'rejected' ? "#EF4444" :
                                                "#64748B"
                            }]}>
                                {user.verificationStatus === 'approved' ? 'Approved' :
                                    user.verificationStatus === 'pending' ? 'Pending' :
                                        user.verificationStatus === 'rejected' ? 'Rejected' :
                                            'Not Verified'}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.settingsButton]}
                        onPress={() => router.push("settings/SettingsScreen")}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                <Settings size={18} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Settings</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.analyticsButton]}
                        onPress={() => router.push("SellerDashboard")}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                <TrendingUp size={18} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Seller Dashboard</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    {user.role === 'ADMIN' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.adminButton]}
                            onPress={() => router.push("/admin/HomeScreenAdmin")}
                            activeOpacity={0.8}
                        >
                            <View style={styles.actionLeft}>
                                <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                    <Shield size={18} color="#fff" />
                                </View>
                                <Text style={styles.buttonText}>Admin Dashboard</Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}

                    {(!user.verificationStatus || user.verificationStatus === 'none' || user.verificationStatus === 'rejected') && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.verifyButton]}
                            onPress={() => router.push("/VerificationScreen")}
                            activeOpacity={0.8}
                        >
                            <View style={styles.actionLeft}>
                                <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                    <Shield size={18} color="#fff" />
                                </View>
                                <Text style={styles.buttonText}>Get Verified</Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}

                    {user.verificationStatus === 'pending' && (
                        <View style={[styles.actionButton, styles.pendingButton]}>
                            <View style={styles.actionLeft}>
                                <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                    <Shield size={18} color="#fff" />
                                </View>
                                <Text style={styles.buttonText}>Verification Pending</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
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
    messageButton: {
        width: 40, height: 40, borderRadius: 13,
        backgroundColor: "rgba(239,68,68,0.15)",
        borderWidth: 1, borderColor: "rgba(239,68,68,0.35)",
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
    imageWrapper: {
        width: "100%", height: "100%", borderRadius: 68,
        overflow: "hidden", backgroundColor: "#1C1F26",
        borderWidth: 3, borderColor: "#0B0E14",
    },
    image: { width: "100%", height: "100%" },
    badge: {
        position: "absolute", bottom: 8, right: width / 2 - 84,
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "#3B82F6",
        borderWidth: 3, borderColor: "#0B0E14",
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
        backgroundColor: "rgba(59, 130, 246, 0.12)",
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
    statusPending: { backgroundColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.25)" },
    statusRejected: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)" },
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
    favButton: {
        backgroundColor: "#22C55E",
        shadowColor: "#22C55E",
    },
    verifyButton: {
        backgroundColor: "#F59E0B",
        shadowColor: "#F59E0B",
    },
    pendingButton: {
        backgroundColor: "#94A3B8",
        shadowColor: "transparent",
        opacity: 0.8,
    },
    adminButton: {
        backgroundColor: "#8B5CF6",
        shadowColor: "#8B5CF6",
        marginBottom: 4,
    },
    settingsButton: {
        backgroundColor: "#475569",
        shadowColor: "#475569",
        marginBottom: 4,
    },
    analyticsButton: {
        backgroundColor: "#10B981", // Emerald Green
        shadowColor: "#10B981",
        marginBottom: 4,
    },
    logoutButton: {
        backgroundColor: "#EF4444",
        shadowColor: "#EF4444",
    },
    actionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    actionIconBox: {
        width: 36, height: 36, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    buttonText: { color: "#fff", fontFamily: "Lexend_700Bold", fontSize: 16 },
});