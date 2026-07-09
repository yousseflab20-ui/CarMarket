import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../hooks/useAppTheme";
import { MOROCCAN_CITIES } from "../../types/screens/carForm";
import { CarFilters } from "../../types/screens/carScreen";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterModalAnim: Animated.Value;
  filters: CarFilters;
  setFilters: (filters: CarFilters) => void;
  clearFilters: () => void;
  applySearch: () => void;
  isSearching: boolean;
}

export default function FilterModal({
  visible,
  onClose,
  filterModalAnim,
  filters,
  setFilters,
  clearFilters,
  applySearch,
  isSearching,
}: FilterModalProps) {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const { height } = useWindowDimensions();

  const bg = isDark ? "#161921" : "#fff";
  const textColor = isDark ? "#fff" : "#0F172A";
  const inputBg = isDark ? "#09090B" : "#F8FAFC";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0";
  const handleColor = isDark ? "#3F3F46" : "#E2E8F0";
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";
  const closeBtnBg = isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <Animated.View
          style={{
            backgroundColor: bg,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 28,
            paddingTop: 24,
            maxHeight: height * 0.85,
            transform: [{ translateY: filterModalAnim }],
          }}
        >
          {/* Draggable Handle */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 48, height: 5, borderRadius: 999, backgroundColor: handleColor }} />
          </View>

          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text
              className="text-[22px] tracking-[0.5px]"
              style={{ fontFamily: "Lexend_700Bold", color: textColor }}
            >
              {t("carScreen.filters")}
            </Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-red-500 text-sm" style={{ fontFamily: "Lexend_500Medium" }}>
                  {t("carScreen.clearFilters")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: closeBtnBg }}
              >
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Search by name */}
            <Text
              className="text-base mb-3.5 mt-2"
              style={{ fontFamily: "Lexend_600SemiBold", color: textColor }}
            >
              {t("carScreen.searchByName")}
            </Text>
            <TextInput
              className="rounded-2xl p-4 text-[15px] mb-2"
              style={{
                fontFamily: "Lexend_500Medium",
                backgroundColor: inputBg,
                borderWidth: 1,
                borderColor: inputBorder,
                color: textColor,
              }}
              placeholder={t("carScreen.searchByNamePlaceholder") || "e.g. BMW X5, Honda..."}
              placeholderTextColor="#64748B"
              value={filters.search}
              onChangeText={(text) => setFilters({ ...filters, search: text })}
            />

            {/* Price Range */}
            <Text
              className="text-base mb-3.5 mt-6"
              style={{ fontFamily: "Lexend_600SemiBold", color: textColor }}
            >
              {t("carScreen.priceRange")}
            </Text>
            <View className="flex-row items-center justify-between">
              <TextInput
                className="flex-1 rounded-2xl p-4 text-[15px]"
                style={{
                  fontFamily: "Lexend_500Medium",
                  backgroundColor: inputBg,
                  borderWidth: 1,
                  borderColor: inputBorder,
                  color: textColor,
                }}
                placeholder={t("carScreen.minPrice")}
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={filters.minPrice}
                onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
              />
              <View className="w-3.5 h-[2px] mx-3 rounded-[2px]" style={{ backgroundColor: isDark ? "#475569" : "#CBD5E1" }} />
              <TextInput
                className="flex-1 rounded-2xl p-4 text-[15px]"
                style={{
                  fontFamily: "Lexend_500Medium",
                  backgroundColor: inputBg,
                  borderWidth: 1,
                  borderColor: inputBorder,
                  color: textColor,
                }}
                placeholder={t("carScreen.maxPrice")}
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={filters.maxPrice}
                onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
              />
            </View>

            {/* Model Year */}
            <Text
              className="text-base mb-3.5 mt-6"
              style={{ fontFamily: "Lexend_600SemiBold", color: textColor }}
            >
              {t("carScreen.modelYear")}
            </Text>
            <TextInput
              className="w-full rounded-2xl p-4 text-[15px]"
              style={{
                fontFamily: "Lexend_500Medium",
                backgroundColor: inputBg,
                borderWidth: 1,
                borderColor: inputBorder,
                color: textColor,
              }}
              placeholder={t("carScreen.yearPlaceholder")}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={filters.year}
              onChangeText={(text) => setFilters({ ...filters, year: text })}
            />

            {/* Transmission */}
            <Text
              className="text-base mb-3.5 mt-6"
              style={{ fontFamily: "Lexend_600SemiBold", color: textColor }}
            >
              {t("carScreen.transmission")}
            </Text>
            <View className="flex-row items-center justify-between">
              {(["Automatic", "Manual"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  className="flex-1 rounded-2xl p-4 items-center mx-1.5"
                  style={{
                    backgroundColor: filters.transmission === type ? "rgba(59,130,246,0.1)" : inputBg,
                    borderWidth: 1,
                    borderColor: filters.transmission === type ? "rgba(59,130,246,0.4)" : inputBorder,
                  }}
                  onPress={() =>
                    setFilters({ ...filters, transmission: filters.transmission === type ? "" : type })
                  }
                >
                  <Text
                    style={[
                      { fontFamily: "Lexend_600SemiBold", fontSize: 15 },
                      filters.transmission === type ? { color: "#3B82F6" } : { color: subTextColor },
                    ]}
                  >
                    {type === "Automatic" ? t("carScreen.automatic") : t("carScreen.manual")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* City */}
            <Text
              className="text-base mb-3.5 mt-6"
              style={{ fontFamily: "Lexend_600SemiBold", color: textColor }}
            >
              {t("carScreen.city")}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {["All", ...MOROCCAN_CITIES].map((c, i) => (
                <TouchableOpacity
                  key={i}
                  className="px-4 py-3 rounded-full"
                  style={{
                    backgroundColor: filters.city === c ? "rgba(59,130,246,0.1)" : inputBg,
                    borderWidth: 1,
                    borderColor: filters.city === c ? "rgba(59,130,246,0.4)" : inputBorder,
                  }}
                  onPress={() => setFilters({ ...filters, city: filters.city === c ? "" : c })}
                >
                  <Text
                    style={[
                      { fontFamily: "Lexend_500Medium", fontSize: 14 },
                      filters.city === c ? { color: "#3B82F6" } : { color: subTextColor },
                    ]}
                  >
                    {t(`carScreen.cities.${c.toLowerCase()}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View
            className="pt-4 pb-7 mt-2.5"
            style={{ borderTopWidth: 1, borderTopColor: dividerColor }}
          >
            <TouchableOpacity
              className="bg-blue-500 py-4 rounded-[20px] items-center"
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5,
              }}
              onPress={applySearch}
              disabled={isSearching}
            >
              <Text
                className="text-white text-base tracking-[0.5px]"
                style={{ fontFamily: "Lexend_700Bold" }}
              >
                {isSearching ? t("carScreen.searching") : t("carScreen.showVehicles")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
