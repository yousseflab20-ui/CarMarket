import { useAppTheme } from '../hooks/useAppTheme';
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCheck, BellRing, ArrowLeft, RefreshCw } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import NotificationService from "../service/notification.service";
import notificationService from "../service/notification.service";
import { queryClient } from "../lib/react-query";
import { useThemeStore } from "../store/themeStore";

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: NotificationService.getNotifications,
  });

  const { theme, systemTheme, isDark } = useAppTheme();

  const C = {
    bg: isDark ? "#09090B" : "#F8FAFC",
    surface: isDark ? "#131316" : "#FFFFFF",
    headerBg: isDark ? "rgba(9, 9, 11, 0.95)" : "rgba(248, 250, 252, 0.95)",
    border: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)",
    white: isDark ? "#F8FAFC" : "#0F172A",
    textLight: isDark ? "#CBD5E1" : "#334155",
    muted: isDark ? "#94A3B8" : "#64748B",
    mutedDark: isDark ? "#475569" : "#94A3B8",
    blue: "#3B82F6",
    blueDim: isDark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.06)",
    blueBorder: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.15)",
    iconBg: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
    redBg: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.08)",
    red: "#EF4444",
    whitePure: "#FFFFFF",
  };

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
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.blue} />
        <Text style={{ fontFamily: "Lexend_500Medium", color: C.muted, marginTop: 16 }}>
          {t("notifications.loading")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: C.bg }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: C.redBg,
          alignItems: "center", justifyContent: "center", marginBottom: 20
        }}>
          <Bell size={36} color={C.red} />
        </View>
        <Text style={{ fontFamily: "Lexend_700Bold", fontSize: 20, color: C.white }}>
          {t("notifications.errorTitle")}
        </Text>
        <Text style={{ fontFamily: "Lexend_400Regular", color: C.muted, marginTop: 8, textAlign: "center" }}>
          {t("notifications.errorSubtitle")}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            marginTop: 28,
            backgroundColor: C.blue,
            paddingHorizontal: 24, paddingVertical: 14,
            borderRadius: 16,
            flexDirection: "row", alignItems: "center", gap: 8
          }}
        >
          <RefreshCw size={18} color={C.whitePure} />
          <Text style={{ fontFamily: "Lexend_600SemiBold", color: C.whitePure, fontSize: 16 }}>
            {t("notifications.tryAgain")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Premium Header */}
      <View className="px-5 pt-4 pb-6 border-b z-10" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.headerBg, borderBottomColor: C.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 44, height: 44,
              borderRadius: 14,
              backgroundColor: C.iconBg,
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: C.border
            }}
          >
            <ArrowLeft size={22} color={C.textLight} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontFamily: "Lexend_700Bold", fontSize: 22, color: C.white }}>
              {t("notifications.title")}
            </Text>
            <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 13, color: C.muted, marginTop: 2 }}>
              {t("notifications.subtitle")}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleClearAll}
          style={{
            width: 44, height: 44,
            borderRadius: 14,
            backgroundColor: C.blueDim,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: C.blueBorder
          }}
        >
          <CheckCheck size={20} color={C.blue} />
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
                backgroundColor: C.blueDim,
                borderWidth: 1.5, borderColor: C.blueBorder,
                alignItems: "center", justifyContent: "center", marginBottom: 24,
            }}>
              <BellRing size={44} color={C.blue} strokeWidth={1.5} />
            </View>
            <Text style={{ fontFamily: "Lexend_700Bold", fontSize: 20, color: C.white, textAlign: "center", marginBottom: 10 }}>
              {t("notifications.emptyTitle")}
            </Text>
            <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 15, color: C.mutedDark, textAlign: "center", lineHeight: 24 }}>
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
                backgroundColor: isUnread ? C.blueDim : C.surface,
                borderWidth: 1,
                borderColor: isUnread ? C.blueBorder : C.border,
              }}
            >
              {/* Icon Container */}
              <View style={{
                width: 48, height: 48,
                borderRadius: 24,
                backgroundColor: isUnread ? (isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)") : C.iconBg,
                alignItems: "center", justifyContent: "center",
                marginRight: 14
              }}>
                <Bell size={22} color={isUnread ? C.blue : C.muted} />
              </View>

              {/* Content */}
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text 
                  style={{ 
                    fontFamily: isUnread ? "Lexend_600SemiBold" : "Lexend_400Regular", 
                    fontSize: 15, 
                    color: isUnread ? C.white : C.textLight,
                    lineHeight: 22,
                    marginBottom: 6
                  }}
                >
                  {item.text}
                </Text>
                <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 13, color: C.muted }}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>

              {/* Unread Indicator */}
              {isUnread && (
                <View style={{
                  width: 10, height: 10,
                  borderRadius: 5,
                  backgroundColor: C.blue,
                  marginTop: 6,
                  shadowColor: C.blue,
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