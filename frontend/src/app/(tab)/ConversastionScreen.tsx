import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
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
            <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B", justifyContent: "center", alignItems: "center" }}>
                <Text className="text-red-500 text-base" style={{ fontFamily: "Lexend_400Regular" }}>{t('chat.failedLoad')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
            <View className="flex-row items-center p-4 border-b border-[#18181B] bg-[#09090B]">
                <TouchableOpacity className="mr-4 p-2 rounded-xl bg-[#18181B]">
                    <ArrowLeft size={22} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl" style={{ fontFamily: "Lexend_700Bold" }}>{t('chat.messages')}</Text>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
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
                            className="flex-row bg-[#18181B] p-4 rounded-2xl mb-3 items-center"
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
                                    className="w-[50px] h-[50px] rounded-full bg-[#27272A]"
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
                    <View className="justify-center items-center flex-1">
                        <Text className="text-slate-500 text-base mt-10" style={{ fontFamily: "Lexend_400Regular" }}>{t('chat.noConversations')}</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}