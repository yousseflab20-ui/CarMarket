import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getConversations } from "../../service/chat/endpoint.message";
import { useAuthStore } from "../../store/authStore";

export default function ViewAllConversations({ navigation }: any) {
    const user = useAuthStore((state) => state.user);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchConversations = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getConversations(Number(user.id));
                setConversations(res.allConversations || []);
            } catch (err) {
                console.error("Error fetching conversations:", err);
                setError("Failed to load conversations");
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    const openConversation = (conversation: any) => {
        if (!user) return;

        const otherUserId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id;
        navigation.navigate("ConversastionScreen", {
            conversationId: conversation.id,
            myId: user.id,
            user2Id: otherUserId,
        });
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>Please log in to view conversations</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Messages</Text>
                </View>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Messages</Text>
                </View>
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.centerContent}>
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <Text style={styles.emptySubtext}>Start chatting with other users</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const otherUserId = item.user1Id === user.id ? item.user2Id : item.user1Id;
                    const lastMessage = item.Messages?.[item.Messages.length - 1];

                    return (
                        <TouchableOpacity
                            style={styles.conversationItem}
                            onPress={() => openConversation(item)}
                        >
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{otherUserId.toString().charAt(0)}</Text>
                            </View>
                            <View style={styles.conversationContent}>
                                <Text style={styles.conversationTitle}>User {otherUserId}</Text>
                                <Text style={styles.lastMessage} numberOfLines={1}>
                                    {lastMessage?.content || "No messages yet"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14"
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)"
    },
    headerTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 24
    },
    listContent: {
        padding: 16,
        flexGrow: 1
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    conversationItem: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "#1C1F26",
        marginBottom: 10,
        borderRadius: 12,
        alignItems: "center"
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },
    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600"
    },
    conversationContent: {
        flex: 1
    },
    conversationTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4
    },
    lastMessage: {
        color: "#94A3B8",
        fontSize: 14
    },
    emptyText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8
    },
    emptySubtext: {
        color: "#94A3B8",
        fontSize: 14
    },
    errorText: {
        color: "#EF4444",
        fontSize: 16,
        textAlign: "center"
    }
});
