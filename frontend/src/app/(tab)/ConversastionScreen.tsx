import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MessageSquare } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../../service/chat/endpoint.message";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { router } from "expo-router";
import { Conversation } from "../../types/chat";
import { ConversastionScreenProps } from "../../types/screens/conversations";
import { AuthState } from "../../types/store/auth";


export default function ConversastionScreen({ navigation }: ConversastionScreenProps) {
    const { t } = useTranslation();
    const { user } = useAuthStore() as AuthState;

    const { unreadCountsByConversation } = useChatStore();

    const { data: conversations = [], isLoading, error } = useQuery<Conversation[], Error>({
        queryKey: ["conversations"],
        queryFn: getConversations,
    });

    console.log("log conversastion", conversations)
    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#080C14", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#080C14", justifyContent: "center", alignItems: "center" }}>
                <Text className="text-red-500 text-base" style={{ fontFamily: "Lexend_400Regular" }}>{t('chat.failedLoad')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#080C14" }}>
            <View className="flex-row items-center p-4 border-b border-white/5 bg-[#080C14]">
                <TouchableOpacity className="mr-4 w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/5">
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl" style={{ fontFamily: "Lexend_700Bold" }}>{t('chat.messages')}</Text>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[{ padding: 16 }, conversations.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
                renderItem={({ item }) => {
                    const otherUser =
                        item.user1?.id === user?.id
                            ? item.user2
                            : item.user1;

                    if (!otherUser) return null;


                    const lastMessage =
                        item.Messages && item.Messages.length > 0
                            ? item.Messages[0].content
                            : t('chat.noMessages');

                    const lastMessageTime =
                        item.Messages && item.Messages.length > 0
                            ? new Date(item.Messages[0].createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "";

                    return (
                        <TouchableOpacity
                            className="flex-row bg-[#141B27] p-4 rounded-2xl mb-3 items-center border border-white/5"
                            onPress={() =>
                                router.push({
                                    pathname: "/ViewMessaageUse",
                                    params: {
                                        conversationId: item.id,
                                        otherUserId: otherUser.id,
                                        otherUserName: otherUser.name,
                                        otherUserPhoto: otherUser.photo,
                                    },
                                })
                            }
                        >
                            <View className="mr-4">
                                <Image
                                    source={{
                                        uri: otherUser?.photo || "https://via.placeholder.com/50",
                                    }}
                                    className="w-[50px] h-[50px] rounded-full bg-[#1E293B]"
                                />
                            </View>

                            <View className="flex-1">
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-white text-base" style={{ fontFamily: "Lexend_600SemiBold" }}>{otherUser?.name}</Text>
                                    <Text className="text-slate-500 text-xs" style={{ fontFamily: "Lexend_400Regular" }}>{lastMessageTime}</Text>
                                </View>

                                <View className="flex-row items-center justify-between mt-1">
                                    <Text className="text-slate-400 text-sm flex-1" style={{ fontFamily: "Lexend_400Regular" }} numberOfLines={1}>
                                        {lastMessage}
                                    </Text>
                                    {unreadCountsByConversation[item.id] > 0 && (
                                        <View className="bg-red-500 min-w-[20px] h-5 rounded-full justify-center items-center px-1 ml-2">
                                            <Text className="text-white text-[11px]" style={{ fontFamily: "Lexend_700Bold" }}>
                                                {unreadCountsByConversation[item.id]}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}

                ListEmptyComponent={
                    <View style={{ alignItems: "center", paddingHorizontal: 32, paddingBottom: 60 }}>
                        {/* Icon */}
                        <View style={{
                            width: 100, height: 100, borderRadius: 50,
                            backgroundColor: "rgba(59,130,246,0.08)",
                            borderWidth: 1.5, borderColor: "rgba(59,130,246,0.15)",
                            alignItems: "center", justifyContent: "center",
                            marginBottom: 24,
                        }}>
                            <MessageSquare size={44} color="#3B82F6" strokeWidth={1.5} />
                        </View>

                        {/* Title */}
                        <Text style={{
                            fontFamily: "Lexend_700Bold",
                            fontSize: 20,
                            color: "#F1F5F9",
                            textAlign: "center",
                            marginBottom: 10,
                        }}>
                            {t('chat.noConversations')}
                        </Text>

                        {/* Subtitle */}
                        <Text style={{
                            fontFamily: "Lexend_400Regular",
                            fontSize: 14,
                            color: "#475569",
                            textAlign: "center",
                            lineHeight: 22,
                        }}>
                            {t('chat.noConversationsSubtitle') || "Browse cars and start a conversation with a seller."}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}