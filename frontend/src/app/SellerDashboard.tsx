import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTotalViews } from "../service/car/api"
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from "react-native-chart-kit";

export default function SellerDashboard() {
    const { data: CarView, error, isLoading } = useQuery({
        queryKey: ['totalViews'],
        queryFn: getTotalViews
    })

    const carsData = CarView?.carsData || [];
    const topCars = carsData.slice(0, 5); // display up to 5 cars on the chart to prevent squishing
    const chartLabels = topCars.length > 0 ? topCars.map((c: any) => c.title.substring(0, 8) + (c.title.length > 8 ? ".." : "")) : ["No Data"];
    const chartDataValues = topCars.length > 0 ? topCars.map((c: any) => c.views) : [0];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Seller Dashboard</Text>
                <Text style={styles.headerSubtitle}>Monitor your listings performance</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007bff" />
                        <Text style={styles.loadingText}>Loading dashboard...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
                        <Text style={styles.errorText}>Failed to load data. Please try again later.</Text>
                    </View>
                ) : (
                    <View style={styles.statsContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                            <View style={[styles.statCard, { flex: 1, padding: 16 }]}>
                                <View style={[styles.statIconContainer, { width: 44, height: 44, marginRight: 12 }]}>
                                    <Ionicons name="eye" size={22} color="#007bff" />
                                </View>
                                <View style={styles.statInfo}>
                                    <Text style={[styles.statLabel, { fontSize: 11 }]}>Total Views</Text>
                                    <Text style={[styles.statValue, { fontSize: 24 }]}>{CarView?.totalViews || 0}</Text>
                                </View>
                            </View>

                            <View style={[styles.statCard, { flex: 1, padding: 16 }]}>
                                <View style={[styles.statIconContainer, { width: 44, height: 44, marginRight: 12, backgroundColor: 'rgba(40, 167, 69, 0.1)' }]}>
                                    <Ionicons name="car" size={22} color="#28a745" />
                                </View>
                                <View style={styles.statInfo}>
                                    <Text style={[styles.statLabel, { fontSize: 11 }]}>Listings</Text>
                                    <Text style={[styles.statValue, { fontSize: 24 }]}>{CarView?.totalListings || 0}</Text>
                                </View>
                            </View>
                        </View>
                        
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Views by Car</Text>
                            {topCars.length > 0 ? (
                                <BarChart
                                    data={{
                                        labels: chartLabels,
                                        datasets: [
                                            {
                                                data: chartDataValues
                                            }
                                        ]
                                    }}
                                    width={Dimensions.get("window").width - 80}
                                    height={240}
                                    yAxisLabel=""
                                    yAxisSuffix=""
                                    chartConfig={{
                                        backgroundColor: "#ffffff",
                                        backgroundGradientFrom: "#ffffff",
                                        backgroundGradientTo: "#ffffff",
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(108, 117, 125, ${opacity})`,
                                        style: {
                                            borderRadius: 16
                                        },
                                        barPercentage: 0.6,
                                    }}
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16
                                    }}
                                    showValuesOnTopOfBars={true}
                                />
                            ) : (
                                <View style={{ height: 150, justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name="car-sport-outline" size={40} color="#ccc" />
                                    <Text style={{ marginTop: 10, color: '#aaa' }}>No cars listed yet</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.comingSoonCard}>
                            <Ionicons name="time-outline" size={24} color="#6c757d" />
                            <Text style={styles.comingSoonText}>More analytics coming soon...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f6f9',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#eaedf1',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1d20',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    container: {
        padding: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6c757d',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f5c6cb',
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: '#dc3545',
        textAlign: 'center',
        fontWeight: '500',
    },
    statsContainer: {
        marginTop: 10,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 16,
    },
    statIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 15,
        color: '#6c757d',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1d20',
    },
    chartCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 16,
        alignItems: 'center'
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1d20',
        alignSelf: 'flex-start',
        marginBottom: 10
    },
    comingSoonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eef2f5',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e6ea',
        borderStyle: 'dashed',
        marginTop: 10,
    },
    comingSoonText: {
        marginLeft: 10,
        fontSize: 15,
        color: '#6c757d',
        fontWeight: '500',
    }
});