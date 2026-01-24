import { useBuyerOrdersQuery } from "../../service/order/queries";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock, Car } from "lucide-react-native";
export default function BuyerOrdersScreen({ navigation }: any) {
    const { data: orders, isLoading, isError } = useBuyerOrdersQuery();

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
                    <Text style={styles.loadingText}>Loading your bookings...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Failed to load bookings</Text>
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
                <Text style={styles.headerTitle}>My Bookings</Text>
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
                        <Text style={styles.emptyTitle}>No Bookings</Text>
                        <Text style={styles.emptyText}>
                            You haven't made any car reservations yet.
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
                                <Text style={styles.carTitle}>{item.car?.title || "Car details unavailable"}</Text>
                                <Text style={styles.carSubtitle}>Booking #{item.id}</Text>
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
                            <Text style={styles.messageLabel}>Your Message:</Text>
                        </View>
                        <Text style={styles.messageText}>{item.message}</Text>
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
        backgroundColor: "#2D3545",
        padding: 14,
        borderRadius: 12,
    },
});
