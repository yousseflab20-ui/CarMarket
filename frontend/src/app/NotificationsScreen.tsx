import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react-native";
import NotificationService from "../service/notification.service";
import notificationService from "../service/notification.service";
import { queryClient } from "../lib/react-query";

export default function NotificationsScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: NotificationService.getNotifications,
  });
 useEffect(() => {

        const markNotificationsAsRead = async () => {

            try {

                await notificationService.markAllAsRead();

                queryClient.setQueryData(
                    ["unread-notifications-count"],
                    {
                        success: true,
                        count: 0,
                    }
                );

            } catch (error) {

                console.error(error);

            }

        };

        markNotificationsAsRead();

    }, []);
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#09090B] px-6">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-base text-slate-400">
          Loading notifications...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#09090B] px-6">
        <Bell size={50} color="#3B82F6" />

        <Text className="mt-4 text-lg font-semibold text-white">
          Something went wrong
        </Text>

        <Text className="mt-2 text-center text-slate-400">
          We couldn't load your notifications.
        </Text>

        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-5 rounded-2xl bg-[#3B82F6] px-5 py-3 shadow-lg shadow-[#3B82F6]/20"
        >
          <Text className="font-semibold text-white">
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#09090B]">

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-800 bg-[#111827] px-5 pb-4 pt-14">
        <View>
          <Text className="text-2xl font-bold text-white">
            Notifications
          </Text>
          <Text className="text-sm text-slate-400">
            Latest updates from your account
          </Text>
        </View>

        <TouchableOpacity className="rounded-full bg-[#1F2937] p-3 shadow-lg shadow-[#3B82F6]/10">
          <CheckCheck size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={data?.notifications || []}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-32">
            <Bell size={55} color="#3B82F6" />

            <Text className="mt-4 text-lg font-semibold text-white">
              No notifications yet
            </Text>

            <Text className="mt-2 text-center text-slate-400">
              When you receive notifications,
              they will appear here.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.75}
            className={`mb-3 rounded-3xl border p-4 ${
              item.seen
                ? "border-slate-800 bg-[#111827]"
                : "border-[#3B82F6]/20 bg-[#17233D]"
            }`}
          >
            <View className="flex-row items-start justify-between">

              <View className="flex-1 pr-3">

                {!item.opened && (
                  <View className="mb-2 self-start rounded-full bg-[#1D4ED8] px-3 py-1">
                    <Text className="text-xs font-semibold text-white">
                      New
                    </Text>
                  </View>
                )}

                <Text className="text-[15px] font-medium leading-6 text-white">
                  {item.text}
                </Text>

                <Text className="mt-2 text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>

              {!item.opened && (
                <View className="mt-1 h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}