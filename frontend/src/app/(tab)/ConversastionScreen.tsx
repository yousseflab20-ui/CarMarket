import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MessageSquare, Phone, PhoneOff, Image as ImageIcon, Mic } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations } from "../../service/chat/endpoint.message";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { router } from "expo-router";
import { Conversation } from "../../types/chat";
import { ConversastionScreenProps } from "../../types/screens/conversations";
import { AuthState } from "../../types/store/auth";
import SocketService from "../../service/SocketService";
import { useEffect } from "react";

export default function ConversastionScreen({
  navigation,
}: ConversastionScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore() as AuthState;
  const queryClient = useQueryClient();

  const { unreadCountsByConversation } = useChatStore();

  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery<Conversation[], Error>({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  // Real-time: refresh conversation list when new message arrives via socket
  useEffect(() => {
    const socket = SocketService.getInstance().getSocket();
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      if (message && message.conversationId) {
        // Nsiftou l'Serveur blli wsselna l'message f l'Background ola l'ChatList
        socket.emit("message_delivered", {
          userId: user?.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [queryClient]);

  console.log("log conversastion", conversations);
  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#09090B",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#09090B",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          className="text-red-500 text-base"
          style={{ fontFamily: "Lexend_400Regular" }}
        >
          {t("chat.failedLoad")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <View className="flex-row items-center p-4 border-b border-[#18181B] bg-[#09090B]">
        <TouchableOpacity className="mr-4 p-2 rounded-xl bg-[#18181B]">
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text
          className="text-white text-xl"
          style={{ fontFamily: "Lexend_700Bold" }}
        >
          {t("chat.messages")}
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          { padding: 16 },
          conversations.length === 0 && {
            flexGrow: 1,
            justifyContent: "center",
          },
        ]}
        renderItem={({ item }) => {
          const otherUser =
            item.user1?.id === user?.id ? item.user2 : item.user1;

          if (!otherUser) return null;

          const isUnread = unreadCountsByConversation[item.id] > 0;

          const getLastMessagePreview = () => {
            if (!item.Messages || item.Messages.length === 0) {
              return (
                <Text className="text-slate-500 text-[13px]" style={{ fontFamily: "Lexend_400Regular" }} numberOfLines={1}>
                  {t("chat.noMessages")}
                </Text>
              );
            }

            const msg = item.Messages[0];
            const textColor = isUnread ? "text-slate-200" : "text-slate-400";
            const fontFam = isUnread ? "Lexend_500Medium" : "Lexend_400Regular";

            if (msg.type === "call") {
              try {
                const callData = JSON.parse(msg.content);
                const isMissed = callData.status === "missed" || callData.status === "rejected";

                if (isMissed) {
                  return (
                    <View className="flex-row items-center">
                      <PhoneOff size={14} color="#EF4444" strokeWidth={2.5} style={{ marginRight: 5 }} />
                      <Text className="text-red-500 text-[13px]" style={{ fontFamily: "Lexend_500Medium" }} numberOfLines={1}>
                        Missed Call
                      </Text>
                    </View>
                  );
                }

                if (callData.status === "ended") {
                  const mins = Math.floor(callData.duration / 60);
                  const secs = String(callData.duration % 60).padStart(2, "0");
                  return (
                    <View className="flex-row items-center">
                      <Phone size={14} color={isUnread ? "#E2E8F0" : "#94A3B8"} strokeWidth={2} style={{ marginRight: 5 }} />
                      <Text className={`${textColor} text-[13px]`} style={{ fontFamily: fontFam }} numberOfLines={1}>
                        Call Ended • {mins}:{secs}
                      </Text>
                    </View>
                  );
                }

                return (
                  <View className="flex-row items-center">
                    <Phone size={14} color={isUnread ? "#E2E8F0" : "#94A3B8"} style={{ marginRight: 5 }} />
                    <Text className={`${textColor} text-[13px]`} style={{ fontFamily: fontFam }} numberOfLines={1}>Call</Text>
                  </View>
                );
              } catch {
                return <Text className={`${textColor} text-[13px]`} style={{ fontFamily: fontFam }} numberOfLines={1}>Call</Text>;
              }
            }

            if (msg.type === "image") {
              return (
                <View className="flex-row items-center">
                  <ImageIcon size={14} color={isUnread ? "#E2E8F0" : "#94A3B8"} style={{ marginRight: 5 }} />
                  <Text className={`${textColor} text-[13px]`} style={{ fontFamily: fontFam }} numberOfLines={1}>Photo</Text>
                </View>
              );
            }

            if (msg.type === "audio") {
              return (
                <View className="flex-row items-center">
                  <Mic size={14} color={isUnread ? "#E2E8F0" : "#94A3B8"} style={{ marginRight: 5 }} />
                  <Text className={`${textColor} text-[13px]`} style={{ fontFamily: fontFam }} numberOfLines={1}>Voice message</Text>
                </View>
              );
            }

            return (
              <Text className={`${textColor} text-[13px] flex-1`} style={{ fontFamily: fontFam }} numberOfLines={1}>
                {msg.content}
              </Text>
            );
          };

          const lastMessageTime =
            item.Messages && item.Messages.length > 0
              ? new Date(item.Messages[0].createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row bg-[#18181B] border border-white/5 p-[14px] rounded-[20px] mb-[10px] items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 3,
              }}
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
              <View className="mr-4 relative">
                <Image
                  source={{
                    uri: otherUser?.photo || "https://via.placeholder.com/50",
                  }}
                  className="w-[52px] h-[52px] rounded-full bg-[#27272A] border-[1.5px] border-[#27272A]"
                />
              </View>

              <View className="flex-1 justify-center">
                <View className="flex-row justify-between items-center mb-[4px]">
                  <Text
                    className="text-white text-[16px] tracking-tight flex-1"
                    style={{ fontFamily: isUnread ? "Lexend_700Bold" : "Lexend_600SemiBold" }}
                    numberOfLines={1}
                  >
                    {otherUser?.name}
                  </Text>
                  <Text
                    className="text-[11px] ml-2"
                    style={{
                      fontFamily: isUnread ? "Lexend_600SemiBold" : "Lexend_400Regular",
                      color: isUnread ? "#3B82F6" : "#64748B",
                    }}
                  >
                    {lastMessageTime}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    {getLastMessagePreview()}
                  </View>
                  {isUnread && (
                    <View className="bg-[#3B82F6] min-w-[22px] h-[22px] rounded-full justify-center items-center px-[6px] shadow-sm shadow-blue-500/30">
                      <Text
                        className="text-white text-[11px]"
                        style={{ fontFamily: "Lexend_700Bold" }}
                      >
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
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 32,
              paddingBottom: 60,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(59,130,246,0.08)",
                borderWidth: 1.5,
                borderColor: "rgba(59,130,246,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <MessageSquare size={44} color="#3B82F6" strokeWidth={1.5} />
            </View>

            {/* Title */}
            <Text
              style={{
                fontFamily: "Lexend_700Bold",
                fontSize: 20,
                color: "#F1F5F9",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {t("chat.noConversations")}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontFamily: "Lexend_400Regular",
                fontSize: 14,
                color: "#475569",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {t("chat.noConversationsSubtitle") ||
                "Browse cars and start a conversation with a seller."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
