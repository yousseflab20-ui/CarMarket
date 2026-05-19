import { View, Text, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTotalViews } from "../service/car/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, CarFront, Lightbulb, AlertCircle } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LineChart } from "react-native-chart-kit";
import { SellerStats, CarViewData } from "../types/screens/sellerDashboard";

const { width } = Dimensions.get("window");

export default function SellerDashboard() {
    const { t } = useTranslation();
    const { data: CarView, error, isLoading } = useQuery<SellerStats, Error>({
        queryKey: ['totalViews'],
        queryFn: getTotalViews
    });

    const carsData = CarView?.carsData || [];
    const topCars = carsData.slice(0, 5);
    const chartLabels = topCars.length > 0 ? topCars.map((c: CarViewData) => c.title.substring(0, 8) + (c.title.length > 8 ? ".." : "")) : ["No Data"];
    const chartDataValues = topCars.length > 0 ? topCars.map((c: CarViewData) => c.views) : [0];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E14" }}>
            <View className="flex-row items-center justify-between px-5 py-3.5 mb-2.5">
                <TouchableOpacity onPress={() => router.back()} className="w-[42px] h-[42px] rounded-[14px] bg-white/[0.05] border border-white/[0.08] items-center justify-center">
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl tracking-wider" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.dashboard')}</Text>
                <View className="w-[42px]" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                {isLoading ? (
                    <View className="items-center justify-center mt-[60px]">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="mt-4 text-base text-white" style={{ fontFamily: "Lexend_500Medium" }}>{t('seller.loadingStats')}</Text>
                    </View>
                ) : error ? (
                    <View className="bg-[#EF4444]/10 mx-5 mt-5 p-6 rounded-[20px] items-center border border-[#EF4444]/30">
                        <AlertCircle size={48} color="#EF4444" />
                        <Text className="mt-3 text-[15px] text-[#EF4444] text-center" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('seller.failedLoad')}</Text>
                    </View>
                ) : (
                    <View className="px-5">
                        <Text className="text-[13px] text-[#64748B] mb-3 tracking-wider uppercase" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.overview')}</Text>

                        <View className="flex-row gap-3 mb-7">
                            <View className="flex-1 bg-[#1C1F26] rounded-[20px] p-4 items-center border border-white/[0.05]">
                                <View className="w-[42px] h-[42px] rounded-[14px] items-center justify-center mb-2.5 bg-[#3B82F6]/12">
                                    <Eye size={18} color="#3B82F6" />
                                </View>
                                <Text className="text-2xl text-white mb-1" style={{ fontFamily: "Lexend_800ExtraBold" }}>{CarView?.totalViews || 0}</Text>
                                <Text className="text-[12px] text-[#94A3B8] tracking-wider" style={{ fontFamily: "Lexend_500Medium" }}>{t('seller.totalViews')}</Text>
                            </View>

                            <View className="flex-1 bg-[#1C1F26] rounded-[20px] p-4 items-center border border-white/[0.05]">
                                <View className="w-[42px] h-[42px] rounded-[14px] items-center justify-center mb-2.5 bg-[#22C55E]/12">
                                    <CarFront size={18} color="#22C55E" />
                                </View>
                                <Text className="text-2xl text-white mb-1" style={{ fontFamily: "Lexend_800ExtraBold" }}>{CarView?.totalListings || 0}</Text>
                                <Text className="text-[12px] text-[#94A3B8] tracking-wider" style={{ fontFamily: "Lexend_500Medium" }}>{t('seller.listings')}</Text>
                            </View>
                        </View>

                        <Text className="text-[13px] text-[#64748B] mb-3 tracking-wider uppercase" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.viewsByCar')}</Text>
                        <View className="bg-[#1C1F26] rounded-[24px] py-5 px-0 mb-7 border border-white/[0.05]">
                            {topCars.length > 0 ? (
                                <View className="items-center -ml-2.5">
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
                                            backgroundColor: "#1C1F26",
                                            backgroundGradientFrom: "#1C1F26",
                                            backgroundGradientTo: "#1C1F26",
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                                            propsForDots: {
                                                r: "5",
                                                strokeWidth: "2",
                                                stroke: "#1C1F26"
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
                                <View className="h-[180px] justify-center items-center bg-white/[0.02] rounded-[20px]">
                                    <CarFront size={40} color="#64748B" />
                                    <Text className="mt-3 text-base text-[#94A3B8]" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('seller.noCars')}</Text>
                                    <Text className="mt-1 text-[13px] text-[#64748B]" style={{ fontFamily: "Lexend_400Regular" }}>{t('seller.addCarPerformance')}</Text>
                                </View>
                            )}
                        </View>

                        <Text className="text-[13px] text-[#64748B] mb-3 tracking-wider uppercase" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.insights')}</Text>
                        <View className="flex-row bg-[#F59E0B]/10 p-[18px] rounded-[20px] items-center border border-[#F59E0B]/20">
                            <View className="w-11 h-11 rounded-[12px] bg-[#F59E0B]/15 items-center justify-center mr-4">
                                <Lightbulb size={20} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-[#F59E0B] mb-1" style={{ fontFamily: "Lexend_700Bold" }}>{t('seller.proTip')}</Text>
                                <Text className="text-[13px] text-[#F59E0B]/80 leading-[18px]" style={{ fontFamily: "Lexend_400Regular" }}>{t('seller.proTipDesc')}</Text>
                            </View>
                        </View>

                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}