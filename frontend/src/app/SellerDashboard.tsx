import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
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
    })


    const carsData = CarView?.carsData || [];
    const topCars = carsData.slice(0, 5);
    const chartLabels = topCars.length > 0 ? topCars.map((c: CarViewData) => c.title.substring(0, 8) + (c.title.length > 8 ? ".." : "")) : ["No Data"];
    const chartDataValues = topCars.length > 0 ? topCars.map((c: CarViewData) => c.views) : [0];


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('seller.dashboard')}</Text>
                <View style={{ width: 42 }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>{t('seller.loadingStats')}</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <AlertCircle size={48} color="#EF4444" />
                        <Text style={styles.errorText}>{t('seller.failedLoad')}</Text>
                    </View>
                ) : (
                    <View style={styles.dashboardBody}>
                        
                        <Text style={styles.sectionTitle}>{t('seller.overview')}</Text>
                        
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
                                    <Eye size={18} color="#3B82F6" />
                                </View>
                                <Text style={styles.statValue}>{CarView?.totalViews || 0}</Text>
                                <Text style={styles.statLabel}>{t('seller.totalViews')}</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: "rgba(34, 197, 94, 0.12)" }]}>
                                    <CarFront size={18} color="#22C55E" />
                                </View>
                                <Text style={styles.statValue}>{CarView?.totalListings || 0}</Text>
                                <Text style={styles.statLabel}>{t('seller.listings')}</Text>
                            </View>
                        </View>
                        
                        <Text style={styles.sectionTitle}>{t('seller.viewsByCar')}</Text>
                        <View style={styles.chartWrapper}>
                            {topCars.length > 0 ? (
                                <View style={styles.chartInner}>
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
                                        style={styles.chartStyle}
                                        withInnerLines={false}
                                        withOuterLines={false}
                                    />
                                </View>
                            ) : (
                                <View style={styles.emptyChart}>
                                    <CarFront size={40} color="#64748B" />
                                    <Text style={styles.emptyChartText}>{t('seller.noCars')}</Text>
                                    <Text style={styles.emptyChartSub}>{t('seller.addCarPerformance')}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.sectionTitle}>{t('seller.insights')}</Text>
                        <View style={styles.insightCard}>
                            <View style={styles.insightIcon}>
                                <Lightbulb size={20} color="#F59E0B" />
                            </View>
                            <View style={styles.insightTexts}>
                                <Text style={styles.insightTitle}>{t('seller.proTip')}</Text>
                                <Text style={styles.insightDesc}>{t('seller.proTipDesc')}</Text>
                            </View>
                        </View>

                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#0B0E14" 
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginBottom: 10,
    },
    headerTitle: { 
        color: "#fff", 
        fontSize: 20, 
        fontFamily: "Lexend_700Bold", 
        letterSpacing: 0.5 
    },
    backButton: {
        width: 42, 
        height: 42, 
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1, 
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center", 
        justifyContent: "center",
    },
    scrollContent: { 
        paddingBottom: 48 
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: "Lexend_500Medium",
        color: '#fff'
    },
    errorContainer: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        marginHorizontal: 20,
        marginTop: 20,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.3)",
    },
    errorText: {
        marginTop: 12,
        fontSize: 15,
        color: '#EF4444',
        textAlign: 'center',
        fontFamily: "Lexend_600SemiBold",
    },
    dashboardBody: {
        paddingHorizontal: 20,
    },
    sectionTitle: { 
        fontSize: 13, 
        fontFamily: "Lexend_700Bold", 
        color: "#64748B", 
        marginBottom: 12, 
        letterSpacing: 1, 
        textTransform: "uppercase" 
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12, 
        marginBottom: 28,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1C1F26",
        borderRadius: 20, 
        padding: 16,
        alignItems: "center",
        borderWidth: 1, 
        borderColor: "rgba(255,255,255,0.05)",
    },
    statIconBox: {
        width: 42, 
        height: 42, 
        borderRadius: 14,
        alignItems: "center", 
        justifyContent: "center",
        marginBottom: 10,
    },
    statValue: { 
        fontSize: 24, 
        fontFamily: "Lexend_800ExtraBold", 
        color: "#fff", 
        marginBottom: 4 
    },
    statLabel: { 
        fontSize: 12, 
        color: "#94A3B8", 
        letterSpacing: 0.3, 
        fontFamily: "Lexend_500Medium" 
    },
    chartWrapper: {
        backgroundColor: "#1C1F26",
        borderRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 0,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    chartInner: {
        alignItems: 'center',
        marginLeft: -10, // Adjust chart kit default padding
    },
    chartStyle: {
        borderRadius: 16,
    },
    emptyChart: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(255,255,255,0.02)",
        borderRadius: 20,
    },
    emptyChartText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: "Lexend_600SemiBold",
        color: '#94A3B8',
    },
    emptyChartSub: {
        marginTop: 4,
        fontSize: 13,
        fontFamily: "Lexend_400Regular",
        color: '#64748B',
    },
    insightCard: {
        flexDirection: 'row',
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.2)",
    },
    insightIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    insightTexts: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 15,
        fontFamily: "Lexend_700Bold",
        color: '#F59E0B',
        marginBottom: 4,
    },
    insightDesc: {
        fontSize: 13,
        color: 'rgba(245, 158, 11, 0.8)',
        fontFamily: "Lexend_400Regular",
        lineHeight: 18,
    }
});