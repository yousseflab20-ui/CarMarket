import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSellerOrdersQuery } from "../../service/order/queries";
import { useAcceptOrderMutation, useRejectOrderMutation } from "../../service/order/mutations";
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock, Car } from "lucide-react-native";
import { useAlertDialog } from "../../context/AlertDialogContext";

export default function SellerOrdersScreen({ navigation }: any) {
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useAlertDialog();

    const { data: orders, isLoading, isError } = useSellerOrdersQuery();

    const acceptMutation = useAcceptOrderMutation();
    const rejectMutation = useRejectOrderMutation();

    // Helper to wrap mutate with dialogs
    const handleAccept = (id: number) => {
        acceptMutation.mutate(id, {
            onSuccess: () => showSuccess("Order accepted successfully!"),
            onError: (error) => showError(error, "Failed to Accept")
        });
    };

    const handleReject = (id: number) => {
        rejectMutation.mutate(id, {
            onSuccess: () => showSuccess("Order has been rejected"),
            onError: (error) => showError(error, "Failed to Reject")
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "#F59E0B";
            case "accepted": return "#10B981";
            case "rejected": return "#EF4444";
            case "completed": return "#3B82F6";
            default: return "#94A3B8";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <Clock size={16} color="#F59E0B" />;
            case "accepted": return <CheckCircle size={16} color="#10B981" />;
            case "rejected": return <XCircle size={16} color="#EF4444" />;
            default: return <Clock size={16} color="#94A3B8" />;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
                <View style={styles.centerContainer}>
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Failed to load orders</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={styles.backBtn} />
            </View>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MessageSquare size={64} color="#64748B" />
                        <Text style={styles.emptyTitle}>No Orders Yet</Text>
                        <Text style={styles.emptyText}>
                            You haven't received any car reservation requests yet.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.carIconContainer}>
                                <Car size={20} color="#3B82F6" />
                            </View>
                            <View style={styles.carInfo}>
                                <Text style={styles.carTitle}>{item.car.title}</Text>
                                <Text style={styles.carSubtitle}>Buyer: {item.buyer?.name || "Unknown"}</Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
                            {getStatusIcon(item.status)}
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Text>
                        </View>
                        <View style={styles.messageContainer}>
                            <MessageSquare size={16} color="#94A3B8" />
                            <Text style={styles.messageLabel}>Customer Message:</Text>
                        </View>
                        <Text style={styles.messageText}>{item.message}</Text>
                        {item.status === "pending" && (
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.rejectBtn]}
                                    onPress={() => handleReject(item.id)}
                                    disabled={rejectMutation.isPending}
                                >
                                    <XCircle size={18} color="#fff" />
                                    <Text style={styles.btnText}>
                                        {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.acceptBtn]}
                                    onPress={() => handleAccept(item.id)}
                                    disabled={acceptMutation.isPending}
                                >
                                    <CheckCircle size={18} color="#fff" />
                                    <Text style={styles.btnText}>
                                        {acceptMutation.isPending ? "Accepting..." : "Accept"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#94A3B8",
        fontWeight: "600",
    },
    errorText: {
        fontSize: 16,
        color: "#EF4444",
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#1C1F26",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        marginTop: 20,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: 22,
    },
    card: {
        backgroundColor: "#1C1F26",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    carIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#2D3545",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    carInfo: {
        flex: 1,
    },
    carTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    carSubtitle: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "600",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 16,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "700",
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    messageLabel: {
        fontSize: 13,
        color: "#94A3B8",
        fontWeight: "600",
    },
    messageText: {
        fontSize: 15,
        color: "#E2E8F0",
        lineHeight: 22,
        marginBottom: 20,
        backgroundColor: "#2D3545",
        padding: 14,
        borderRadius: 12,
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    acceptBtn: {
        backgroundColor: "#10B981",
    },
    rejectBtn: {
        backgroundColor: "#EF4444",
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
});
