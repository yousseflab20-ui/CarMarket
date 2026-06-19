import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCheck, BellRing, ArrowLeft, RefreshCw } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import NotificationService from "../service/notification.service";
import notificationService from "../service/notification.service";
import { queryClient } from "../lib/react-query";

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: NotificationService.getNotifications,
  });

  const handleClearAll = async () => {
    try {
      await notificationService.markAllAsRead();
      queryClient.setQueryData(["unread-notifications-count"], {
        success: true,
        count: 0,
      });
      refetch();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  useEffect(() => {
    const markNotificationsAsRead = async () => {
      try {
        await notificationService.markAllAsRead();
        queryClient.setQueryData(["unread-notifications-count"], {
          success: true,
          count: 0,
        });
      } catch (error) {
        console.error(error);
      }
    };
    markNotificationsAsRead();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return t("notifications.justNow");
    if (diffInSeconds < 3600) return t("notifications.minutesAgo", { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t("notifications.hoursAgo", { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t("notifications.daysAgo", { count: Math.floor(diffInSeconds / 86400) });
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#09090B] px-6">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ fontFamily: "Lexend_500Medium", color: "#94A3B8", marginTop: 16 }}>
          {t("notifications.loading")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#09090B] px-6">
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: "rgba(239,68,68,0.1)",
          alignItems: "center", justifyContent: "center", marginBottom: 20
        }}>
          <Bell size={36} color="#EF4444" />
        </View>
        <Text style={{ fontFamily: "Lexend_700Bold", fontSize: 20, color: "#F8FAFC" }}>
          {t("notifications.errorTitle")}
        </Text>
        <Text style={{ fontFamily: "Lexend_400Regular", color: "#94A3B8", marginTop: 8, textAlign: "center" }}>
          {t("notifications.errorSubtitle")}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            marginTop: 28,
            backgroundColor: "#3B82F6",
            paddingHorizontal: 24, paddingVertical: 14,
            borderRadius: 16,
            flexDirection: "row", alignItems: "center", gap: 8
          }}
        >
          <RefreshCw size={18} color="#fff" />
          <Text style={{ fontFamily: "Lexend_600SemiBold", color: "#fff", fontSize: 16 }}>
            {t("notifications.tryAgain")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }} edges={['top']}>
      {/* Premium Header */}
      <View className="px-5 pt-4 pb-6 border-b border-white/5 bg-[#09090B]/95 z-10" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 44, height: 44,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.05)",
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.05)"
            }}
          >
            <ArrowLeft size={22} color="#E2E8F0" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontFamily: "Lexend_700Bold", fontSize: 22, color: "#F8FAFC" }}>
              {t("notifications.title")}
            </Text>
            <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 13, color: "#64748B", marginTop: 2 }}>
              {t("notifications.subtitle")}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleClearAll}
          style={{
            width: 44, height: 44,
            borderRadius: 14,
            backgroundColor: "rgba(59,130,246,0.1)",
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: "rgba(59,130,246,0.2)"
          }}
        >
          <CheckCheck size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={data?.notifications || []}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          { padding: 16 },
          (!data?.notifications || data.notifications.length === 0) && { flexGrow: 1, justifyContent: "center" }
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", paddingHorizontal: 32, paddingBottom: 60 }}>
            <View style={{
                width: 100, height: 100, borderRadius: 50,
                backgroundColor: "rgba(59,130,246,0.08)",
                borderWidth: 1.5, borderColor: "rgba(59,130,246,0.15)",
                alignItems: "center", justifyContent: "center", marginBottom: 24,
            }}>
              <BellRing size={44} color="#3B82F6" strokeWidth={1.5} />
            </View>
            <Text style={{ fontFamily: "Lexend_700Bold", fontSize: 20, color: "#F1F5F9", textAlign: "center", marginBottom: 10 }}>
              {t("notifications.emptyTitle")}
            </Text>
            <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 15, color: "#475569", textAlign: "center", lineHeight: 24 }}>
              {t("notifications.emptySubtitle")}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isUnread = !item.opened;
          
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                padding: 16,
                marginBottom: 12,
                borderRadius: 20,
                backgroundColor: isUnread ? "rgba(59,130,246,0.06)" : "#131316",
                borderWidth: 1,
                borderColor: isUnread ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
              }}
            >
              {/* Icon Container */}
              <View style={{
                width: 48, height: 48,
                borderRadius: 24,
                backgroundColor: isUnread ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                alignItems: "center", justifyContent: "center",
                marginRight: 14
              }}>
                <Bell size={22} color={isUnread ? "#3B82F6" : "#94A3B8"} />
              </View>

              {/* Content */}
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text 
                  style={{ 
                    fontFamily: isUnread ? "Lexend_600SemiBold" : "Lexend_400Regular", 
                    fontSize: 15, 
                    color: isUnread ? "#F8FAFC" : "#CBD5E1",
                    lineHeight: 22,
                    marginBottom: 6
                  }}
                >
                  {item.text}
                </Text>
                <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 13, color: "#64748B" }}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>

              {/* Unread Indicator */}
              {isUnread && (
                <View style={{
                  width: 10, height: 10,
                  borderRadius: 5,
                  backgroundColor: "#3B82F6",
                  marginTop: 6,
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 6,
                  elevation: 4
                }} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}