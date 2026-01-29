import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../../service/chat/endpoint.message";
import { useAuthStore } from "../../stores/authStore";

export default function ConversastionScreen({ navigation }: any) {
    const { user } = useAuthStore();

    const { data: conversations = [], isLoading, error } = useQuery({
        queryKey: ["conversations"],
        queryFn: getConversations,
        refetchInterval: 10000,
    });

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Failed to load conversations</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {/* <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const otherUserId = item.user1Id === user?.id ? item.user2Id : item.user1Id;

                    const lastMessage = item.Messages && item.Messages.length > 0 ? item.Messages[0].content : "No messages yet";
                    const lastMessageTime = item.Messages && item.Messages.length > 0
                        ? new Date(item.Messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "";

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate("ViewMessaageUse", { conversationId: item.id, otherUserId })}
                        >
                            <View style={styles.avatarContainer}>
                            </View>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.userName}>User {otherUserId}</Text>
                                    <Text style={styles.time}>{lastMessageTime}</Text>
                                </View>
                                <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No conversations yet</Text>
                    </View>
                }
            /> */}
            {/* Paus conversastion user */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14"
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1C1F26",
        backgroundColor: "#0B0E14",
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 12,
        backgroundColor: "#1C1F26"
    },
    headerTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 20
    },
    listContent: {
        padding: 16
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#1C1F26",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: "center"
    },
    avatarContainer: {
        marginRight: 16
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#2D3545"
    },
    cardContent: {
        flex: 1
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4
    },
    userName: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16
    },
    time: {
        color: "#64748B",
        fontSize: 12
    },
    lastMessage: {
        color: "#94A3B8",
        fontSize: 14
    },
    errorText: {
        color: "#EF4444",
        fontSize: 16
    },
    emptyText: {
        color: "#64748B",
        fontSize: 16,
        marginTop: 40
    }
});
