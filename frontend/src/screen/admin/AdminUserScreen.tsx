import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../../service/admin/endpoint.admin";
import { getAllCar } from "../../service/admin/endpoint.Car";
import { Users, Car } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function AdminHomeScreen({ navigation }: any) {
    const { data: cars, isLoading: loadingCars } = useQuery({
        queryKey: ["getAllCar"],
        queryFn: getAllCar
    });

    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ["getAllUser"],
        queryFn: getAllUser
    });

    if (loadingUsers || loadingCars) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b7bec" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard Admin</Text>

            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: "#e8f4fd" }]}>
                    <Users size={36} color="#4b7bec" />
                    <Text style={styles.statNumber}>{(users as any)?.length || 0}</Text>
                    <Text style={styles.statLabel}>Utilisateurs</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: "#fff4e6" }]}>
                    <Car size={36} color="#ffa502" />
                    <Text style={styles.statNumber}>{(cars as any)?.length || 0}</Text>
                    <Text style={styles.statLabel}>Voitures</Text>
                </View>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("AllUsers")}
                >
                    <Text style={styles.buttonText}>Voir tous les utilisateurs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#ff6b6b" }]}
                    onPress={() => navigation.navigate("AdminCarScreen")}
                >
                    <Text style={styles.buttonText}>Voir toutes les voitures</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fd",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666"
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 30,
        color: "#2d3436",
        textAlign: "center"
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 40,
        width: "100%"
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 8,
        color: "#2d3436"
    },
    statLabel: {
        fontSize: 14,
        color: "#636e72",
        marginTop: 4
    },
    buttonsContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    button: {
        backgroundColor: "#4b7bec",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: "center",
        width: width * 0.8
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16
    }
});
