import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from "react-native";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ArrowLeft, Mail, Hash, Shield, Star, MessageCircle, Heart, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useRef, useEffect } from "react";

const { width } = Dimensions.get("window");

export default function ProfileUser({ }: any) {
    const { user, logout } = useAuthStore();

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
            {/* Subtle ambient glow */}
            <View style={styles.ambientGlow} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => router.push("/ViewMessaageUse")}
                >
                    <Mail size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar */}
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

                {/* Name & Info */}
                <Animated.View style={[styles.infoHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.name}>{user.name}</Text>
                    <View style={styles.emailContainer}>
                        <Mail size={13} color="#64748B" />
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                    <View style={styles.levelBadge}>
                        <Shield size={13} color="#3B82F6" />
                        <Text style={styles.levelText}>Premium Member</Text>
                    </View>
                </Animated.View>

                {/* Stats */}
                <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconBox}>
                            <Hash size={16} color="#3B82F6" />
                        </View>
                        <Text style={styles.statValue}>{user.id}</Text>
                        <Text style={styles.statLabel}>User ID</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: "rgba(139, 92, 246, 0.12)" }]}>
                            <Star size={16} color="#8B5CF6" />
                        </View>
                        <Text style={styles.statValue}>Jan 2024</Text>
                        <Text style={styles.statLabel}>Joined</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                            <View style={styles.activePulse} />
                        </View>
                        <Text style={[styles.statValue, { color: "#22C55E" }]}>Online</Text>
                        <Text style={styles.statLabel}>Status</Text>
                    </View>
                </Animated.View>

                {/* Account Details */}
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
                            <View style={[styles.rowIconBox, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                                <Shield size={14} color="#22C55E" />
                            </View>
                            <Text style={styles.label}>Status</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <View style={styles.activeDot} />
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push("/ViewAllConversations")}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                <MessageCircle size={18} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Messages</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.favButton]}
                        onPress={() => router.push("/MyFavoriteCar")}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                <Heart size={18} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Favorites</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={logout}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                                <LogOut size={18} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Logout</Text>
                        </View>
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0E14" },
    text: { color: "#fff", fontSize: 16, fontWeight: "500" },

    ambientGlow: {
        position: "absolute",
        top: -60,
        alignSelf: "center",
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(59, 130, 246, 0.06)",
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginBottom: 10,
    },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700", letterSpacing: 0.5 },
    backButton: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center", justifyContent: "center",
    },
    messageButton: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: "#3B82F6",
        alignItems: "center", justifyContent: "center",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
    },

    scrollContent: { paddingBottom: 48 },

    // Avatar
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

    // Name
    infoHeader: { alignItems: "center", marginBottom: 28, paddingHorizontal: 20 },
    name: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 8, letterSpacing: 0.5 },
    emailContainer: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
    email: { fontSize: 14, color: "#64748B" },
    levelBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)",
    },
    levelText: { color: "#3B82F6", fontSize: 13, fontWeight: "600" },

    // Stats
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
    statValue: { fontSize: 14, fontWeight: "700", color: "#fff", marginBottom: 3 },
    statLabel: { fontSize: 11, color: "#64748B", letterSpacing: 0.3 },

    // Info Section
    infoSection: {
        marginHorizontal: 20,
        backgroundColor: "#1C1F26",
        borderRadius: 24, padding: 20,
        marginBottom: 20,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
    },
    sectionTitle: { fontSize: 13, fontWeight: "700", color: "#64748B", marginBottom: 18, letterSpacing: 1, textTransform: "uppercase" },
    infoRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", paddingVertical: 11,
    },
    infoLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    rowIconBox: {
        width: 32, height: 32, borderRadius: 10,
        alignItems: "center", justifyContent: "center",
    },
    label: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
    value: {
        color: "#fff", fontSize: 13, fontWeight: "600",
        flex: 1, textAlign: "right", marginLeft: 16,
    },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginLeft: 44 },
    statusBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
        borderWidth: 1, borderColor: "rgba(34, 197, 94, 0.2)",
    },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
    statusText: { color: "#22C55E", fontSize: 12, fontWeight: "600" },

    // Actions
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
    logoutButton: {
        backgroundColor: "#EF4444",
        shadowColor: "#EF4444",
    },
    actionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    actionIconBox: {
        width: 36, height: 36, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});