import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ArrowLeft, Mail, Hash, Shield, Star } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "../service/chat/endpoint.message"

export default function ProfileUser({ navigation, route }: any) {
    const { user2Id } = route.params;
    const { user, logout } = useAuthStore();
    //useMutation
    const queryClient = useQueryClient();
    const Message = useMutation({
        mutationFn: message,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["message"] })
    })
    const handelMessage = (user2Id: number) => {
        if (!user2Id) {
            console.warn("user2Id is missing");
            return;
        }
        Message.mutate(user2Id);
        console.log("Sent message to user:", user2Id);
    }
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handelMessage(user2Id)} style={styles.backButton}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.imageSection}>
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
                        <Star size={12} color="#fff" fill="#fff" />
                    </View>
                </View>

                <View style={styles.infoHeader}>
                    <Text style={styles.name}>{user.name}</Text>
                    <View style={styles.emailContainer}>
                        <Mail size={14} color="#64748B" />
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                    <View style={styles.levelBadge}>
                        <Shield size={14} color="#3B82F6" />
                        <Text style={styles.levelText}>Premium Member</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Hash size={18} color="#3B82F6" />
                        </View>
                        <Text style={styles.statValue}>{user.id}</Text>
                        <Text style={styles.statLabel}>User ID</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Star size={18} color="#8B5CF6" />
                        </View>
                        <Text style={styles.statValue}>Jan 2024</Text>
                        <Text style={styles.statLabel}>Joined</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Account Details</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value} >{user.email}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>User ID</Text>
                        <Text style={styles.value}>{user.id}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.activeDot} />
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logout}
                    activeOpacity={0.7}
                >
                    <LogOut color="#EF4444" size={20} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.navigate("FavoriteScreen")}
                    activeOpacity={0.7}
                >
                    <LogOut color="#83ef44" size={20} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: 0.5,
    },
    imageSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    gradientBorder: {
        width: 144,
        height: 144,
        borderRadius: 72,
        padding: 4,
        backgroundColor: "#3B82F6",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    imageWrapper: {
        width: "100%",
        height: "100%",
        borderRadius: 68,
        overflow: "hidden",
        backgroundColor: "#1C1F26",
        borderWidth: 3,
        borderColor: "#0B0E14",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    badge: {
        position: "absolute",
        bottom: 8,
        right: "28%",
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#3B82F6",
        borderWidth: 3,
        borderColor: "#0B0E14",
        alignItems: "center",
        justifyContent: "center",
    },
    infoHeader: {
        alignItems: "center",
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    name: {
        fontSize: 28,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    emailContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    email: {
        fontSize: 15,
        color: "#64748B",
    },
    levelBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.2)",
    },
    levelText: {
        color: "#3B82F6",
        fontSize: 13,
        fontWeight: "600",
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1C1F26",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#64748B",
    },
    infoSection: {
        marginHorizontal: 20,
        backgroundColor: "#1C1F26",
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 20,
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    label: {
        color: "#64748B",
        fontSize: 14,
    },
    value: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
        marginLeft: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E",
    },
    statusText: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.2)",
    },
    logoutText: {
        color: "#EF4444",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    text: {
        color: "#fff",
    },
});