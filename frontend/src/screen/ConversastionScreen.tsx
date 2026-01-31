import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConvirsastion, getMessages } from "../service/chat/endpoint.message";
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";

interface Message {
    id: number;
    content: string;
    senderId: number;
    userId?: number;
    createdAt: string;
}

export default function ConversastionScreen({ navigation, route }: any) {
    const { conversationId } = route.params;

    const queryClient = useQueryClient();
    const [textMessage, setTextMessage] = useState("");
    const createMessageMutation = useMutation({
        mutationFn: createConvirsastion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] })
    });
    const user = useAuthStore((state) => state.user);
    const myId = user?.id;
    const handleSendMessage = async () => {
        if (!textMessage) return;
        await createMessageMutation.mutateAsync({
            conversationId,
            content: textMessage,
            senderId: myId,
        });
        setTextMessage("");
    };
    const { data: messages = [] } = useQuery<Message[]>({
        queryKey: ["messages", conversationId],
        queryFn: () => getMessages(conversationId)
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Conversation</Text>
            </View>
            {/* <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                renderItem={({ item }) => {
                    if (!myId) return null;

                    const messageSenderId = item.senderId || item.userId;

                    if (!messageSenderId) {
                        console.warn("Message missing senderId and userId:", item);
                        return null;
                    }

                    const isMe = Number(messageSenderId) === Number(myId);

                    return (
                        <View style={[styles.messageBubble, isMe ? styles.rightBubble : styles.leftBubble]}>

                            <Text style={[styles.messageText, isMe ? { color: "#fff" } : {}]}>
                                {item.content}
                            </Text>

                            <Text style={[styles.time, isMe ? { color: "#E5E7EB" } : {}]}>
                                {item.createdAt?.slice(11, 16) || "10:00"}
                            </Text>
                        </View>
                    );
                }}
            /> */}
            <View style={styles.inputBar}>
                <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={textMessage}
                    onChangeText={setTextMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)"
    },
    backButton: {
        marginRight: 12,
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.08)"
    },
    messageBubble: {
        maxWidth: "70%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 10
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
        fontSize: 14,
        lineHeight: 20,
        color: "#E5E7EB"
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
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
        backgroundColor: "#0B0E14"
    },
    input: {
        flex: 1,
        backgroundColor: "#1C1F26",
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: "#fff",
        fontSize: 14,
        marginRight: 10
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center"
    }
});
