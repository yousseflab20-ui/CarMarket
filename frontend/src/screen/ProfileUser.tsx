import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useAuthStore } from "../store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ArrowLeft, Mail, Hash, Shield, Star } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "../service/chat/endpoint.message";

export default function ProfileUser({ navigation, route }: any) {
    const { conversationId } = route.params;
    const { user, logout } = useAuthStore();
    const queryClient = useQueryClient();

    const Message = useMutation({
        mutationFn: message,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["message"] })
    });

    const handelMessage = (conversationId: number) => {
        if (!conversationId) {
            console.warn("user2Id is missing");
            return;
        }
        Message.mutate(conversationId);
        console.log("Sent message to user:", conversationId);
    };

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
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => handelMessage(conversationId)}
                >
                    <Mail size={20} color="#fff" />
                </TouchableOpacity>
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
                        <Hash size={18} color="#3B82F6" />
                        <Text style={styles.statValue}>{user.id}</Text>
                        <Text style={styles.statLabel}>User ID</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Star size={18} color="#8B5CF6" />
                        <Text style={styles.statValue}>Jan 2024</Text>
                        <Text style={styles.statLabel}>Joined</Text>
                    </View>
                </View>
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Account Details</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user.email}</Text>
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
                    style={styles.actionButton}
                    onPress={() => handelMessage(conversationId)}
                >
                    <Text style={styles.buttonText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
                    onPress={logout}
                >
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#22C55E" }]}
                    onPress={() => navigation.navigate("ViewAllConversations")}
                >
                    <Text style={styles.buttonText}>Favorites</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },

    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    container: {
        flex: 1,
        backgroundColor: "#0B0E14"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B0E14"
    },
    scrollContent: {
        paddingBottom: 40
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 20
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)"
    },
    messageButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center"
    },
    imageSection: {
        alignItems: "center",
        marginBottom: 24
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
        elevation: 10
    },
    imageWrapper: {
        width: "100%",
        height: "100%",
        borderRadius: 68,
        overflow: "hidden",
        backgroundColor: "#1C1F26",
        borderWidth: 3,
        borderColor: "#0B0E14"
    },
    image: {
        width: "100%",
        height: "100%"
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
        justifyContent: "center"
    },
    infoHeader: {
        alignItems: "center",
        marginBottom: 32,
        paddingHorizontal: 20
    },
    name: {
        fontSize: 28,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 8,
        letterSpacing: 0.5
    },
    emailContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12
    },
    email: {
        fontSize: 15,
        color: "#64748B"
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
        borderColor: "rgba(59, 130, 246, 0.2)"
    },
    levelText: {
        color: "#3B82F6",
        fontSize: 13,
        fontWeight: "600"
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1C1F26",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)"
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4
    },
    statLabel: {
        fontSize: 12,
        color: "#64748B"
    },
    infoSection: {
        marginHorizontal: 20,
        backgroundColor: "#1C1F26",
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)"
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 20,
        letterSpacing: 0.5
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12
    },
    label: {
        color: "#64748B",
        fontSize: 14
    },
    value: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
        marginLeft: 16
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.05)"
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E"
    },
    statusText: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600"
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 12
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16
    }
});
