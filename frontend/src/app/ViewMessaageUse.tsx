import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createConversation, getMessages } from "../service/chat/endpoint.message";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { router, useLocalSearchParams } from "expo-router";
import SocketService from "../service/SocketService";

interface Message {
    id: number;
    content: string;
    senderId: any;
    conversationId: number;
    createdAt: string;
}

export default function ViewMessageUse() {
    const params = useLocalSearchParams();
    const conversationId = Number(params.conversationId);
    const otherUserId = Number(params.otherUserId);
    const user = useAuthStore((state) => state.user);
    const myId = user?.id;

    // Validation to prevent 400 error if params are missing or NaN
    const isValidId = !isNaN(conversationId) && conversationId > 0;

    const [textMessage, setTextMessage] = useState("");
    const [inputHeight, setInputHeight] = useState(40);
    const flatListRef = useRef<FlatList>(null);

    const { data: rawMessages = [], isLoading, refetch, isError } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => getMessages(conversationId),
        enabled: isValidId,
    });

    const messagesToDisplay = rawMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.userId || msg.senderId,
        conversationId: msg.conversationId,
        createdAt: msg.createdAt,
    }));

    console.log("🎨 Messages to display:", messagesToDisplay.length);

    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();
        socket.emit("user_online", myId);
        console.log(`✅ User ${myId} registered as online`);

        return () => {
            socket.emit("user_offline", myId);
        };
    }, [myId]);
    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();

        const handleReceiveMessage = (message: Message) => {
            console.log("📨 Real-time message received:", message);

            if (String(message.conversationId) === String(conversationId)) {
                refetch();
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [conversationId, refetch]);

    useEffect(() => {
        if (messagesToDisplay.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messagesToDisplay.length]);

    const createMessageMutation = useMutation({
        mutationFn: createConversation,
        onSuccess: () => {
            refetch();
            flatListRef.current?.scrollToEnd({ animated: true });
        },
        onError: (err) => {
            console.error("❌ Failed to send message:", err);
        },
    });

    const handleSendMessage = useCallback(() => {
        if (!textMessage.trim()) return;

        const trimmedMessage = textMessage.trim();

        const newMessage = {
            id: Date.now(),
            content: trimmedMessage,
            senderId: myId!,
            receiverId: otherUserId,
            conversationId,
            createdAt: new Date().toISOString(),
        };

        console.log("📤 Sending message:", newMessage);

        setTextMessage("");

        const socket = SocketService.getInstance().getSocket();
        socket.emit("send_message", newMessage);
    }, [textMessage, myId, otherUserId, conversationId, createMessageMutation]);

    if (!isValidId && !isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Conversation</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.emptyText}>Invalid conversation ID.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Conversation</Text>
                        <Text style={styles.headerSubtitle}>User {otherUserId}</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Conversation</Text>
                    <Text style={styles.headerSubtitle}>User {otherUserId}</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messagesToDisplay}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const isMe = String(item.senderId) === String(myId);
                    return (
                        <View style={[styles.messageBubble, isMe ? styles.rightBubble : styles.leftBubble]}>
                            <Text style={[styles.messageText, isMe ? { color: "#fff" } : {}]}>
                                {item.content}
                            </Text>
                            <Text style={[styles.time, isMe ? { color: "#E0E7FF" } : {}]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
                    </View>
                }
            />

            <View style={styles.inputBar}>
                <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor="#94A3B8"
                    style={[styles.input, { height: Math.min(Math.max(40, inputHeight), 120) }]}
                    value={textMessage}
                    onChangeText={setTextMessage}
                    multiline
                    onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !textMessage.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!textMessage.trim() || createMessageMutation.isPending}
                >
                    {createMessageMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Send size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1C1F26",
        backgroundColor: "#0B0E14"
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 12,
        backgroundColor: "#1C1F26"
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 18
    },
    headerSubtitle: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 2
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        color: "#94A3B8",
        marginTop: 12,
        fontSize: 14
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
        flexGrow: 1
    },
    messageBubble: {
        maxWidth: "75%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 12
    },
    leftBubble: {
        backgroundColor: "#1C1F26",
        alignSelf: "flex-start",
        borderTopLeftRadius: 4
    },
    rightBubble: {
        backgroundColor: "#3B82F6",
        alignSelf: "flex-end",
        borderTopRightRadius: 4
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        color: "#E2E8F0"
    },
    time: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: "flex-end",
        color: "#94A3B8"
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: "#1C1F26",
        backgroundColor: "#0B0E14"
    },
    input: {
        flex: 1,
        backgroundColor: "#1C1F26",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: "#fff",
        fontSize: 15,
        marginRight: 12,
        maxHeight: 120
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center"
    },
    sendButtonDisabled: {
        backgroundColor: "#1C1F26",
        opacity: 0.5
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
        fontWeight: "600"
    },
    emptySubtext: {
        color: "#64748B",
        fontSize: 14,
        marginTop: 8
    }
});