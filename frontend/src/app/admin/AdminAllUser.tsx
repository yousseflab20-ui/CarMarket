import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUser, removeUser } from "../../service/admin/endpoint.admin";
import { Users, Mail, Trash2 } from "lucide-react-native";
import { ScrollView } from "native-base";

type User = {
    id: number;
    name: string;
    email: string;
    photo: string;
    role: string;
};

export default function AdminAllUser() {
    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["getAllUser"],
        queryFn: getAllUser
    });

    const removeMutation = useMutation({
        mutationFn: removeUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getAllUser"] })
    });

    const handleDelete = (id: number) => {
        removeMutation.mutate(id);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b7bec" />
                <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={users || []}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHeaderComponent={<Text style={styles.title}>Tous les Utilisateurs</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.photo }} style={styles.avatar} />
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <View style={styles.emailRow}>
                                <Mail size={14} color="#666" />
                                <Text style={styles.email}>{item.email}</Text>
                            </View>
                            <View style={[styles.roleTag, item.role === "admin" ? styles.adminRole : styles.userRole]}>
                                <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                            <Trash2 size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Users size={64} color="#ddd" />
                        <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fd",
        paddingHorizontal: 16,
        paddingTop: 20
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
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "#2d3436",
        textAlign: "center"
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        borderWidth: 2,
        borderColor: "#f0f5ff"
    },
    info: {
        flex: 1
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2d3436",
        marginBottom: 4
    },
    emailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6
    },
    email: {
        marginLeft: 6,
        fontSize: 13,
        color: "#636e72"
    },
    roleTag: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    adminRole: {
        backgroundColor: "#ff6b6b"
    },
    userRole: {
        backgroundColor: "#4b7bec"
    },
    roleText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#fff"
    },
    deleteButton: {
        backgroundColor: "#ff6b6b",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center"
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 16
    }
});