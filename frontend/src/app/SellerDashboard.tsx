import { View, Text, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTotalViews } from "../service/car/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, CarFront, Lightbulb, AlertCircle } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LineChart } from "react-native-chart-kit";
import { SellerStats, CarViewData } from "../types/screens/sellerDashboard";
import { useAppTheme } from "../hooks/useAppTheme";

const { width } = Dimensions.get("window");

export default function SellerDashboard() {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

    const C = {
        bg: isDark ? "#09090B" : "#F8FAFC",
        surface: isDark ? "#18181B" : "#FFFFFF",
        border: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
        white: isDark ? "#FFFFFF" : "#0F172A",
        muted: isDark ? "#94A3B8" : "#64748B",
        dim: isDark ? "#64748B" : "#475569",
        iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        blue: "#3B82F6",
    };

    const { data: CarView, error, isLoading } = useQuery<SellerStats, Error>({
        queryKey: ['totalViews'],
        queryFn: getTotalViews
    });

    const carsData = CarView?.carsData || [];
    const topCars = carsData.slice(0, 5);
    const chartLabels = topCars.length > 0 ? topCars.map((c: CarViewData) => c.title.substring(0, 8) + (c.title.length > 8 ? ".." : "")) : ["No Data"];
    const chartDataValues = topCars.length > 0 ? topCars.map((c: CarViewData) => c.views) : [0];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, marginBottom: 10 }}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.iconBg, borderColor: C.border, borderWidth: 1, alignItems: "center", justifyContent: "center" }}
                >
                    <ArrowLeft size={20} color={C.white} />
                </TouchableOpacity>
                <Text style={{ color: C.white, fontSize: 20, letterSpacing: 0.5, fontFamily: "Lexend_700Bold" }}>{t('seller.dashboard')}</Text>
                <View style={{ width: 42 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                {isLoading ? (
                    <View style={{ alignItems: "center", justifyContent: "center", marginTop: 60 }}>
                        <ActivityIndicator size="large" color={C.blue} />
                        <Text style={{ marginTop: 16, fontSize: 16, color: C.white, fontFamily: "Lexend_500Medium" }}>{t('seller.loadingStats')}</Text>
                    </View>
                ) : error ? (
                    <View style={{ marginHorizontal: 20, marginTop: 20, padding: 24, borderRadius: 20, alignItems: "center", borderWidth: 1, backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }}>
                        <AlertCircle size={48} color="#EF4444" />
                        <Text style={{ marginTop: 12, fontSize: 15, color: "#EF4444", textAlign: "center", fontFamily: "Lexend_600SemiBold" }}>{t('seller.failedLoad')}</Text>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text style={{ fontSize: 13, color: C.dim, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase", fontFamily: "Lexend_700Bold" }}>{t('seller.overview')}</Text>

                        <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
                            <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 20, padding: 16, alignItems: "center", borderWidth: 1, borderColor: C.border }}>
                                <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10, backgroundColor: "rgba(59, 130, 246, 0.12)" }}>
                                    <Eye size={18} color={C.blue} />
                                </View>
                                <Text style={{ fontSize: 24, color: C.white, marginBottom: 4, fontFamily: "Lexend_800ExtraBold" }}>{CarView?.totalViews || 0}</Text>
                                <Text style={{ fontSize: 12, color: C.muted, letterSpacing: 0.5, fontFamily: "Lexend_500Medium" }}>{t('seller.totalViews')}</Text>
                            </View>

                            <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 20, padding: 16, alignItems: "center", borderWidth: 1, borderColor: C.border }}>
                                <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10, backgroundColor: "rgba(34, 197, 94, 0.12)" }}>
                                    <CarFront size={18} color="#22C55E" />
                                </View>
                                <Text style={{ fontSize: 24, color: C.white, marginBottom: 4, fontFamily: "Lexend_800ExtraBold" }}>{CarView?.totalListings || 0}</Text>
                                <Text style={{ fontSize: 12, color: C.muted, letterSpacing: 0.5, fontFamily: "Lexend_500Medium" }}>{t('seller.listings')}</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: 13, color: C.dim, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase", fontFamily: "Lexend_700Bold" }}>{t('seller.viewsByCar')}</Text>
                        <View style={{ backgroundColor: C.surface, borderRadius: 24, paddingVertical: 20, paddingHorizontal: 0, marginBottom: 28, borderWidth: 1, borderColor: C.border }}>
                            {topCars.length > 0 ? (
                                <View style={{ alignItems: "center", marginLeft: -10 }}>
                                    <LineChart
                                        data={{
                                            labels: chartLabels,
                                            datasets: [{ data: chartDataValues }]
                                        }}
                                        width={width - 40}
                                        height={220}
                                        yAxisLabel=""
                                        yAxisSuffix=""
                                        chartConfig={{
                                            backgroundColor: C.surface,
                                            backgroundGradientFrom: C.surface,
                                            backgroundGradientTo: C.surface,
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                            labelColor: (opacity = 1) => isDark ? `rgba(148, 163, 184, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
                                            propsForDots: {
                                                r: "5",
                                                strokeWidth: "2",
                                                stroke: C.surface
                                            },
                                            propsForLabels: {
                                                fontFamily: "Lexend_500Medium",
                                            }
                                        }}
                                        bezier
                                        style={{ borderRadius: 16 }}
                                        withInnerLines={false}
                                        withOuterLines={false}
                                    />
                                </View>
                            ) : (
                                <View style={{ height: 180, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(100, 116, 139, 0.05)", borderRadius: 20, marginHorizontal: 16 }}>
                                    <CarFront size={40} color={C.dim} />
                                    <Text style={{ marginTop: 12, fontSize: 16, color: C.muted, fontFamily: "Lexend_600SemiBold" }}>{t('seller.noCars')}</Text>
                                    <Text style={{ marginTop: 4, fontSize: 13, color: C.dim, fontFamily: "Lexend_400Regular" }}>{t('seller.addCarPerformance')}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={{ fontSize: 13, color: C.dim, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase", fontFamily: "Lexend_700Bold" }}>{t('seller.insights')}</Text>
                        <View style={{ flexDirection: "row", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: 18, borderRadius: 20, alignItems: "center", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.2)" }}>
                            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(245, 158, 11, 0.15)", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                                <Lightbulb size={20} color="#F59E0B" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, color: "#F59E0B", marginBottom: 4, fontFamily: "Lexend_700Bold" }}>{t('seller.proTip')}</Text>
                                <Text style={{ fontSize: 13, color: isDark ? "rgba(245, 158, 11, 0.8)" : "rgba(217, 119, 6, 0.9)", lineHeight: 18, fontFamily: "Lexend_400Regular" }}>{t('seller.proTipDesc')}</Text>
                            </View>
                        </View>

                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}