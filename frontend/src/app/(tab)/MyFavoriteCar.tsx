import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Trash2,
  Star,
  Heart,
  Car,
  Search,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFavorites,
  removeFavorite,
} from "../../service/favorite/endpointfavorite";
import { useFocusEffect, router } from "expo-router";
import { useCallback } from "react";
import { FavoriteCar } from "../../types/screens/favorite";

export default function MyFavoriteCar() {
  const { t } = useTranslation();
  const {
    data: favorites = [],
    isLoading,
    refetch,
  } = useQuery<FavoriteCar[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await getFavorites();
      return res.All.map((fav: any) => fav.Car);
    },
  });

  const queryClient = useQueryClient();
  console.log("log favorite", favorites);
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    }, []),
  );
  const handleRemove = async (carId: number) => {
    try {
      await removeFavorite(carId);
      refetch();
    } catch (err) {
      console.log("Failed to remove favorite:", err);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#09090B] justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <View className="flex-row items-center justify-between px-4 py-3.5">
        <TouchableOpacity className="bg-[#18181B] p-2 rounded-xl">
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text
          className="text-white text-lg"
          style={{ fontFamily: "Lexend_700Bold" }}
        >
          {t("favorites.title")}
        </Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { padding: 16 },
          favorites.length === 0 && { flexGrow: 1, justifyContent: "center" },
        ]}
        ListEmptyComponent={
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
              paddingBottom: 90,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(59,130,246,0.08)", // #3B82F6
                borderWidth: 1.5,
                borderColor: "rgba(59,130,246,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Heart size={44} color="#3B82F6" strokeWidth={1.5} />
            </View>

            {/* Title */}
            <Text
              style={{
                color: "#F1F5F9",
                fontSize: 20,
                fontFamily: "Lexend_700Bold",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {t("favorites.noFavorites")}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                color: "#475569",
                fontSize: 14,
                fontFamily: "Lexend_400Regular",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 32,
              }}
            >
              {t("favorites.noFavoritesSubtitle") ||
                "Browse cars and tap the heart icon to save your favorites here."}
            </Text>

            {/* CTA Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(tab)/CarScreen")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#3B82F6",
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 16,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Search size={18} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontFamily: "Lexend_600SemiBold",
                }}
              >
                {t("favorites.browseCars") || "Browse Cars"}
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-[#18181B] rounded-[18px] mb-4 overflow-hidden border border-[#27272A]"
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/CarDetailScreen",
                params: {
                  car: JSON.stringify(item),
                  user: JSON.stringify(item.User || item.user || null),
                  user2Id: item.userId?.toString() || "",
                },
              })
            }
          >
            <View className="relative">
              <Image
                source={{ uri: item?.images?.[0] }}
                className="w-full h-[190px]"
              />

              <TouchableOpacity
                className="absolute top-2.5 right-2.5 bg-[#EF4444] p-2 rounded-full"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
                onPress={() => handleRemove(item.id)}
              >
                <Trash2 size={18} color="#fff" fill="#EF4444" />
              </TouchableOpacity>
            </View>

            <View className="p-3.5">
              <View className="flex-row justify-between items-center">
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: "Lexend_700Bold" }}
                >
                  {item.title}
                </Text>
                <Star size={18} color="#FACC15" fill="#FACC15" />
              </View>

              <Text
                className="text-[#94A3B8] mt-1 text-[13px]"
                style={{ fontFamily: "Lexend_400Regular" }}
              >
                {item.brand} • {item.model}
              </Text>

              <View className="flex-row justify-between mt-2.5">
                <Text
                  className="text-[#CBD5E1] text-xs"
                  style={{ fontFamily: "Lexend_600SemiBold" }}
                >
                  🚀 {item.speed || 0} {t("car.kmh")}
                </Text>
                <Text
                  className="text-[#CBD5E1] text-xs"
                  style={{ fontFamily: "Lexend_600SemiBold" }}
                >
                  💺 {item.seats || 0} {t("car.seats")}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-3.5">
                <Text
                  className="text-[#3B82F6] text-[15px]"
                  style={{ fontFamily: "Lexend_800ExtraBold" }}
                >
                  {item.pricePerDay || 0} DH / {t("car.day")}
                </Text>
                <Text
                  className="text-[#E5E7EB] text-[13px]"
                  style={{ fontFamily: "Lexend_600SemiBold" }}
                >
                  {item.price || 0} DH
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
