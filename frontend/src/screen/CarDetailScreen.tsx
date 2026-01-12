import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { ArrowLeft, Heart, Info, MapPin, Fuel, Users, Gauge, Clock, Share2 } from "lucide-react-native";
import React from "react";

export default function CarDetailScreen({ navigation, route }: any) {
    const { car } = route.params;
    const [liked, setLiked] = React.useState(false);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: car.photo }}
                    style={styles.carImage}
                    resizeMode="cover"
                />
                <View style={styles.topHeader}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Car Details</Text>
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => setLiked(!liked)}
                    >
                        <Heart
                            size={22}
                            color={liked ? "#EF4444" : "#fff"}
                            fill={liked ? "#EF4444" : "none"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.contentCard}>
                <View style={styles.titleSection}>
                    <View>
                        <Text style={styles.carTitle}>{car.title}</Text>
                        <Text style={styles.carSubtitle}>Luxury Edition • {car.year}</Text>
                    </View>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Share2 size={18} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
                <View style={styles.ratingRow}>
                    <View style={styles.rating}>
                        <Text style={styles.ratingStars}>★★★★★</Text>
                        <Text style={styles.ratingText}>4.8 (127)</Text>
                    </View>
                </View>
                <View style={styles.specsRow}>
                    <View style={styles.specPill}>
                        <Gauge size={16} color="#F59E0B" />
                        <Text style={styles.specValue}>{car.speed || 120}</Text>
                        <Text style={styles.specLabel}>mph</Text>
                    </View>
                    <View style={styles.specPill}>
                        <Users size={16} color="#3B82F6" />
                        <Text style={styles.specValue}>{car.seats || 5}</Text>
                        <Text style={styles.specLabel}>seats</Text>
                    </View>
                    <View style={styles.specPill}>
                        <Fuel size={16} color="#10B981" />
                        <Text style={styles.specValue}>{car.mileage || 5000}</Text>
                        <Text style={styles.specLabel}>km</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.locationCard}>
                        <View style={styles.mapPlaceholder}>
                            <MapPin size={32} color="#3B82F6" />
                            <Text style={styles.mapText}>Casablanca, Morocco</Text>
                        </View>
                    </View>
                    <View style={styles.locationInfo}>
                        <MapPin size={16} color="#EF4444" />
                        <Text style={styles.locationText}>Downtown Casablanca, Morocco</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>
                        {car.description}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rental Information</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <Clock size={20} color="#3B82F6" />
                            <Text style={styles.infoLabel}>Daily Rate</Text>
                            <Text style={styles.infoValue}>${car.pricePerDay || 200}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Gauge size={20} color="#F59E0B" />
                            <Text style={styles.infoLabel}>Availability</Text>
                            <Text style={styles.infoValue}>Ready</Text>
                        </View>
                    </View>

                    <View style={styles.descriptionBox}>
                        <Info size={16} color="#3B82F6" />
                        <Text style={styles.descriptionText}>
                            Full insurance included • Free cancellation • 24/7 Support
                        </Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.buttonsSection}>
                    <TouchableOpacity style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>View More</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bookBtn}>
                        <Text style={styles.bookBtnText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.priceSummary}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Total Price</Text>
                        <Text style={styles.priceAmount}>${car.price}</Text>
                    </View>
                </View>
                <View style={{ height: 20 }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14",
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: 300,
    },
    carImage: {
        width: "100%",
        height: "100%",
    },
    topHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    heartBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    contentCard: {
        backgroundColor: "#1C1F26",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -20,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    titleSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    carTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 4,
    },
    carSubtitle: {
        fontSize: 13,
        color: "#94A3B8",
        fontWeight: "600",
    },
    shareBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#2D3545",
        justifyContent: "center",
        alignItems: "center",
    },
    ratingRow: {
        marginBottom: 16,
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    ratingStars: {
        fontSize: 16,
        color: "#F59E0B",
    },
    ratingText: {
        fontSize: 13,
        color: "#94A3B8",
        fontWeight: "600",
    },
    specsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    specPill: {
        flex: 1,
        backgroundColor: "#2D3545",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        gap: 4,
    },
    specValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    specLabel: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#2D3545",
        marginVertical: 16,
    },
    section: {
        marginBottom: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 12,
    },
    locationCard: {
        width: "100%",
        height: 150,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        backgroundColor: "#2D3545",
    },
    mapPlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2D3545",
        gap: 8,
    },
    mapText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#E2E8F0",
    },
    locationInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#2D3545",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
    },
    locationText: {
        fontSize: 13,
        color: "#E2E8F0",
        fontWeight: "600",
        flex: 1,
    },
    aboutText: {
        fontSize: 14,
        color: "#CBD5E1",
        lineHeight: 22,
        fontWeight: "500",
    },
    infoRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    infoBox: {
        flex: 1,
        backgroundColor: "#2D3545",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        gap: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    descriptionBox: {
        backgroundColor: "#2D3545",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    descriptionText: {
        fontSize: 13,
        color: "#CBD5E1",
        fontWeight: "500",
        flex: 1,
    },
    buttonsSection: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
        marginBottom: 16,
    },
    viewBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#3B82F6",
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
    },
    viewBtnText: {
        color: "#3B82F6",
        fontSize: 15,
        fontWeight: "700",
    },
    bookBtn: {
        flex: 1,
        backgroundColor: "#3B82F6",
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
    },
    bookBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    priceSummary: {
        backgroundColor: "#2D3545",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceLabel: {
        fontSize: 14,
        color: "#94A3B8",
        fontWeight: "600",
    },
    priceAmount: {
        fontSize: 18,
        fontWeight: "800",
        color: "#3B82F6",
    },
});