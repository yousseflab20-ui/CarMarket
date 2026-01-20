import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConvirsastion, getMessages } from "../service/chat/endpoint.message";

export default function ConversastionScreen({ navigation, route }: any) {
    const { conversationId } = route.params;
    const queryClient = useQueryClient();

    const createMessageMutation = useMutation({
        mutationFn: createConvirsastion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", conversationId] })
    });
    const { data: messages = [] } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => getMessages(conversationId)
    });



    const sendMessage = async (text: string) => {
        if (!text) return;
        await createMessageMutation.mutateAsync({ user2Id: conversationId, content: text });
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: "https://via.placeholder.com/100" }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.username}>Car Owner</Text>
                        <Text style={styles.status}>Online</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
                renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.isOwn ? styles.rightBubble : styles.leftBubble]}>
                        <Text style={[styles.messageText, item.isOwn ? { color: "#fff" } : {}]}>
                            {item.content}
                        </Text>
                        <Text style={[styles.time, item.isOwn ? { color: "#E5E7EB" } : {}]}>
                            {item.createdAt?.slice(11, 16) || "10:00"}
                        </Text>
                    </View>
                )}
            />

            <View style={styles.inputBar}>
                <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    onSubmitEditing={(e) => sendMessage(e.nativeEvent.text)}
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
    backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginRight: 12 },
    userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#1C1F26" },
    username: { color: "#fff", fontSize: 16, fontWeight: "700" },
    status: { color: "#22C55E", fontSize: 12, marginTop: 2 },
    messageBubble: { maxWidth: "75%", padding: 12, borderRadius: 16, marginBottom: 10 },
    leftBubble: { backgroundColor: "#1C1F26", alignSelf: "flex-start", borderTopLeftRadius: 4 },
    rightBubble: { backgroundColor: "#3B82F6", alignSelf: "flex-end", borderTopRightRadius: 4 },
    messageText: { color: "#E5E7EB", fontSize: 14, lineHeight: 20 },
    time: { fontSize: 10, color: "#94A3B8", marginTop: 4, alignSelf: "flex-end" },
    inputBar: { flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", backgroundColor: "#0B0E14" },
    input: { flex: 1, backgroundColor: "#1C1F26", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: "#fff", fontSize: 14, marginRight: 10 },
    sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#3B82F6", alignItems: "center", justifyContent: "center" }
});
