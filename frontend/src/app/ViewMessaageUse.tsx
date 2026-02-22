import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send, Phone, Video } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createConversation, getMessages } from "../service/chat/endpoint.message";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { router, useLocalSearchParams } from "expo-router";
import SocketService from "../service/SocketService";
import { Image, Animated } from "react-native";

interface Message {
    id: number;
    content: string;
    senderId: any;
    conversationId: number;
    createdAt: string;
    sender?: {
        id: number;
        name: string;
        photo: string;
    };
}

// Animated message bubble wrapper
function MessageBubble({ item, isMe, index }: { item: Message; isMe: boolean; index: number }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(isMe ? 30 : -30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                delay: Math.min(index * 20, 300),
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 10,
                delay: Math.min(index * 20, 300),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                flexDirection: isMe ? "row-reverse" : "row",
                alignItems: "flex-end",
                marginBottom: 6,
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
            }}
        >
            {!isMe && (
                <Image
                    source={{ uri: item.sender?.photo || "https://via.placeholder.com/36" }}
                    style={styles.avatarSmall}
                />
            )}

            <View style={[styles.bubbleWrapper, isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperThem]}>
                <View style={[styles.messageBubble, isMe ? styles.rightBubble : styles.leftBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                        {item.content}
                    </Text>
                </View>
                <Text style={[styles.time, isMe ? styles.timeMe : styles.timeThem]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
            </View>
        </Animated.View>
    );
}

export default function ViewMessageUse() {
    const params = useLocalSearchParams();
    const conversationId = Number(params.conversationId);
    const otherUserId = Number(params.otherUserId);
    const user = useAuthStore((state) => state.user);
    const myId = user?.id;

    const isValidId = !isNaN(conversationId) && conversationId > 0;

    const [textMessage, setTextMessage] = useState("");
    const [inputHeight, setInputHeight] = useState(40);
    const flatListRef = useRef<FlatList>(null);

    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const { data: rawMessages = [], isLoading, refetch } = useQuery({
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
        sender: msg.sender,
    }));

    const otherUser = messagesToDisplay.find(
        (m: Message) => String(m.sender?.id || m.senderId) !== String(myId)
    )?.sender;

    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();
        socket.emit("user_online", myId);
        return () => { socket.emit("user_offline", myId); };
    }, [myId]);

    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();
        const handleReceiveMessage = (message: Message) => {
            if (String(message.conversationId) === String(conversationId)) refetch();
        };
        socket.on("receive_message", handleReceiveMessage);
        return () => { socket.off("receive_message", handleReceiveMessage); };
    }, [conversationId, refetch]);

    useEffect(() => {
        if (messagesToDisplay.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messagesToDisplay.length]);

    const createMessageMutation = useMutation({
        mutationFn: createConversation,
        onSuccess: () => {
            refetch();
            flatListRef.current?.scrollToEnd({ animated: true });
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
        setTextMessage("");
        const socket = SocketService.getInstance().getSocket();
        socket.emit("send_message", newMessage);
    }, [textMessage, myId, otherUserId, conversationId]);

    if (!isValidId && !isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={20} color="#E2E8F0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat</Text>
                </View>
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Invalid conversation.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={20} color="#E2E8F0" />
                    </TouchableOpacity>
                    <View style={styles.headerSkeleton} />
                </View>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#6EE7B7" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Ambient gradient background */}
            <View style={styles.ambientTop} />
            <View style={styles.ambientBottom} />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
                    },
                ]}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: otherUser?.photo || "https://via.placeholder.com/42" }}
                            style={styles.headerAvatar}
                        />
                        <View style={styles.onlineDot} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{otherUser?.name || "Conversation"}</Text>
                        <Text style={styles.headerStatus}>● online</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Phone size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Video size={18} color="#94A3B8" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Thin separator line with gradient effect */}
            <View style={styles.headerSeparator} />

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messagesToDisplay}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const isMe = String(item.sender?.id || item.senderId) === String(myId);
                    return <MessageBubble item={item} isMe={isMe} index={index} />;
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Send size={24} color="#6EE7B7" />
                        </View>
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Say hello 👋</Text>
                    </View>
                }
            />

            {/* Input Bar */}
            <View style={styles.inputBar}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="Message..."
                        placeholderTextColor="#475569"
                        style={[styles.input, { height: Math.min(Math.max(40, inputHeight), 120) }]}
                        value={textMessage}
                        onChangeText={setTextMessage}
                        multiline
                        onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.sendButton, !textMessage.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!textMessage.trim() || createMessageMutation.isPending}
                    activeOpacity={0.7}
                >
                    {createMessageMutation.isPending ? (
                        <ActivityIndicator size="small" color="#0F172A" />
                    ) : (
                        <Send size={18} color={textMessage.trim() ? "#0F172A" : "#475569"} />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080C14",
    },

    // Ambient light blobs
    ambientTop: {
        position: "absolute",
        top: -60,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "rgba(110, 231, 183, 0.04)",
    },
    ambientBottom: {
        position: "absolute",
        bottom: 80,
        left: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(99, 102, 241, 0.05)",
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "rgba(8, 12, 20, 0.95)",
    },
    headerSeparator: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        marginHorizontal: 0,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 11,
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: "rgba(110, 231, 183, 0.3)",
    },
    onlineDot: {
        position: "absolute",
        bottom: 1,
        right: 1,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#6EE7B7",
        borderWidth: 2,
        borderColor: "#080C14",
    },
    headerTitle: {
        color: "#F1F5F9",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    headerStatus: {
        color: "#6EE7B7",
        fontSize: 11,
        marginTop: 2,
        letterSpacing: 0.5,
        fontWeight: "500",
    },
    headerSkeleton: {
        flex: 1,
        height: 18,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.06)",
        marginLeft: 12,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },

    // List
    listContent: {
        padding: 16,
        paddingBottom: 8,
        flexGrow: 1,
    },

    // Avatar
    avatarSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.08)",
    },

    // Bubbles
    bubbleWrapper: {
        maxWidth: "75%",
    },
    bubbleWrapperMe: {
        alignItems: "flex-end",
    },
    bubbleWrapperThem: {
        alignItems: "flex-start",
    },
    messageBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    leftBubble: {
        backgroundColor: "#141B27",
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
    },
    rightBubble: {
        backgroundColor: "#6EE7B7",
        borderTopRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    messageTextMe: {
        color: "#0F2318",
        fontWeight: "500",
    },
    messageTextThem: {
        color: "#CBD5E1",
    },
    time: {
        fontSize: 10,
        marginTop: 4,
        letterSpacing: 0.3,
    },
    timeMe: {
        color: "rgba(110, 231, 183, 0.5)",
        textAlign: "right",
    },
    timeThem: {
        color: "#475569",
    },

    // Input
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 14,
        paddingVertical: 12,
        paddingBottom: Platform.OS === "ios" ? 12 : 14,
        backgroundColor: "rgba(8,12,20,0.98)",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
        gap: 10,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: "#111827",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(110, 231, 183, 0.15)",
        overflow: "hidden",
    },
    input: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 10,
        color: "#E2E8F0",
        fontSize: 15,
        maxHeight: 120,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#6EE7B7",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#6EE7B7",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    sendButtonDisabled: {
        backgroundColor: "#141B27",
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
    },

    // Empty / Loading
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(110, 231, 183, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(110, 231, 183, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    emptySubtext: {
        color: "#475569",
        fontSize: 14,
        marginTop: 6,
    },
    loadingText: {
        color: "#475569",
        marginTop: 12,
        fontSize: 14,
        letterSpacing: 0.3,
    },
});