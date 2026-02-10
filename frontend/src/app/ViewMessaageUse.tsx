import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConvirsastion, getMessages } from "../service/chat/endpoint.message";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { router, useLocalSearchParams } from "expo-router";

interface Message {
    id: number;
    content: string;
    senderId: number;
    userId?: number;
    createdAt: string;
}

export default function ViewMessaageUse() {
    const params = useLocalSearchParams();
    const conversationId = params.conversationId;
    const userId = params.userId;

    const queryClient = useQueryClient();
    const [textMessage, setTextMessage] = useState("");
    const [inputHeight, setInputHeight] = useState(40);
    const flatListRef = useRef<FlatList>(null);

    const user = useAuthStore((state) => state.user);
    const myId = user?.id;

    const id = Number(conversationId);
    const { data: messages = [], isLoading } = useQuery<Message[]>({
        queryKey: ["messages", id],
        queryFn: () => getMessages(id),
        enabled: !!id,
    });

    const createMessageMutation = useMutation({
        mutationFn: createConvirsastion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            setTextMessage("");
        },
        onError: (err) => {
            console.error("Failed to send message", err);
        },
    });

    const handleSendMessage = () => {
        if (!textMessage.trim()) return;

        createMessageMutation.mutate({
            conversationId,
            content: textMessage,
            senderId: myId,
        });
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    if (isLoading && !messages.length) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Conversation</Text>
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const messageSenderId = item.senderId || item.userId;
                    const isMe = Number(messageSenderId) === Number(myId);
                    return (
                        <View style={[styles.messageBubble, isMe ? styles.rightBubble : styles.leftBubble]}>
                            <Text style={[styles.messageText, isMe ? { color: "#fff" } : {}]}>{item.content}</Text>
                            <Text style={[styles.time, isMe ? { color: "#E0E7FF" } : {}]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                        </View>
                    );
                }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Bar */}
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
                    {createMessageMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1C1F26", backgroundColor: "#0B0E14" },
    backButton: { marginRight: 16, padding: 8, borderRadius: 12, backgroundColor: "#1C1F26" },
    headerTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },
    listContent: { padding: 16, paddingBottom: 20 },
    messageBubble: { maxWidth: "75%", padding: 12, borderRadius: 16, marginBottom: 12 },
    leftBubble: { backgroundColor: "#1C1F26", alignSelf: "flex-start", borderTopLeftRadius: 4 },
    rightBubble: { backgroundColor: "#3B82F6", alignSelf: "flex-end", borderTopRightRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 22, color: "#E2E8F0" },
    time: { fontSize: 10, marginTop: 4, alignSelf: "flex-end", color: "#94A3B8" },
    inputBar: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderTopColor: "#1C1F26", backgroundColor: "#0B0E14" },
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
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#3B82F6", alignItems: "center", justifyContent: "center" },
    sendButtonDisabled: { backgroundColor: "#1C1F26", opacity: 0.5 },
});
