import React, { useState, useRef } from "react";
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ArrowLeft, Heart, Info, MapPin, Fuel, Users, Gauge, Clock, Share2 } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message as openConversation } from "../service/chat/endpoint.message"
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function CarDetailScreen() {
    const { car, user2Id } = useLocalSearchParams<{ car: string; user2Id: string }>();
    console.log("log data car", car)
    const user = useAuthStore((state) => state.user);
    const carObj = car ? JSON.parse(car) : null;
    const user2IdNum = user2Id ? parseInt(user2Id) : undefined;

    const handlePress = () => {
        if (!user2IdNum) return;
        handleMessage(user2IdNum);
    };
    if (!carObj) return <Text>Car data missing!</Text>;
    const queryClient = useQueryClient();
    const [liked, setLiked] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const messageMutation = useMutation<any, unknown, number>({
        mutationFn: openConversation,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["message"] })
    });


    const handleMessage = (user2Id?: number) => {
        if (!user2Id) {
            console.warn("user2Id is missing");
            return;
        }
        messageMutation.mutate(user2Id, {
            onSuccess: (data) => {
                if (data && data.conv && data.conv.id) {
                    router.push({
                        pathname: "/ViewMessaageUse",
                        params: {
                            conversationId: data.conv.id,
                            userId: user?.id?.toString()
                        }
                    });

                } else {
                    console.error("Invalid conversation data:", data);
                    Alert.alert("Error", "Failed to retrieve conversation ID");
                }
            },
            onError: (error) => {
                console.error("Failed to open conversation", error);
                Alert.alert("Error", "Could not open conversation");
            }
        });
    };

    return (
        <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: carObj.images[0] }} style={styles.carImage} resizeMode="cover" />
                <View style={styles.topHeader}>
                    <TouchableOpacity style={styles.backBtn}>
                        <ArrowLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Car Details</Text>
                    <TouchableOpacity style={styles.heartBtn} onPress={() => setLiked(!liked)}>
                        <Heart size={22} color={liked ? "#EF4444" : "#fff"} fill={liked ? "#EF4444" : "none"} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.contentCard}>
                <View style={styles.titleSection}>
                    <View>
                        <Text style={styles.carTitle}>{carObj.title}</Text>
                        <Text style={styles.carSubtitle}>Luxury Edition • {carObj.year}</Text>
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
                        <Text style={styles.specValue}>{carObj.speed || 120}</Text>
                        <Text style={styles.specLabel}>mph</Text>
                    </View>
                    <View style={styles.specPill}>
                        <Users size={16} color="#3B82F6" />
                        <Text style={styles.specValue}>{carObj.seats || 5}</Text>
                        <Text style={styles.specLabel}>seats</Text>
                    </View>
                    <View style={styles.specPill}>
                        <Fuel size={16} color="#10B981" />
                        <Text style={styles.specValue}>{carObj.mileage || 5000}</Text>
                        <Text style={styles.specLabel}>km</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.messageCard} onPress={handlePress}>
                    <Text style={styles.messageText}>💬 Message Seller</Text>
                </TouchableOpacity>

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
                    <Text style={styles.aboutText}>{carObj.description}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rental Information</Text>
                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <Clock size={20} color="#3B82F6" />
                            <Text style={styles.infoLabel}>Daily Rate</Text>
                            <Text style={styles.infoValue}>${carObj.pricePerDay}</Text>
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
                <View style={{ height: 20 }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
    imageContainer: { position: "relative", width: "100%", height: 300 },
    carImage: { width: "100%", height: "100%" },
    topHeader: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
    heartBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    contentCard: { backgroundColor: "#1C1F26", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
    titleSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    carTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 4 },
    carSubtitle: { fontSize: 13, color: "#94A3B8", fontWeight: "600" },
    shareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#2D3545", justifyContent: "center", alignItems: "center" },
    ratingRow: { marginBottom: 16 },
    rating: { flexDirection: "row", alignItems: "center", gap: 8 },
    ratingStars: { fontSize: 16, color: "#F59E0B" },
    ratingText: { fontSize: 13, color: "#94A3B8", fontWeight: "600" },
    specsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    specPill: { flex: 1, backgroundColor: "#2D3545", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 10, alignItems: "center", gap: 4 },
    specValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
    specLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
    messageCard: { width: "90%", alignSelf: "center", height: 60, backgroundColor: "#3B82F6", borderRadius: 16, alignItems: "center", justifyContent: "center", marginVertical: 16, shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    messageText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5, lineHeight: 22 },
    divider: { height: 1, backgroundColor: "#2D3545", marginVertical: 16 },
    section: { marginBottom: 0 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
    locationCard: { width: "100%", height: 150, borderRadius: 14, overflow: "hidden", marginBottom: 12, backgroundColor: "#2D3545" },
    mapPlaceholder: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#2D3545", gap: 8 },
    mapText: { fontSize: 14, fontWeight: "600", color: "#E2E8F0" },
    locationInfo: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#2D3545", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
    locationText: { fontSize: 13, color: "#E2E8F0", fontWeight: "600", flex: 1 },
    aboutText: { fontSize: 14, color: "#CBD5E1", lineHeight: 22, fontWeight: "500" },
    infoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    infoBox: { flex: 1, backgroundColor: "#2D3545", borderRadius: 12, padding: 14, alignItems: "center", gap: 8 },
    infoLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
    infoValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
    descriptionBox: { backgroundColor: "#2D3545", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 },
    descriptionText: { fontSize: 13, color: "#CBD5E1", fontWeight: "500", flex: 1 },
    input: { backgroundColor: "#1C1F26", borderRadius: 12, borderWidth: 1, borderColor: "#334155", color: "#E2E8F0", paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, minHeight: 80, textAlignVertical: "top", fontSize: 14 },
    priceSummary: { backgroundColor: "#2D3545", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
});