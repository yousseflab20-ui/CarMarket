import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUser, removeUser } from "../../service/admin/endpoint.admin";
import { FlatList } from "native-base";
import { Trash2, Users, Mail, Shield, UserRoundPen } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";

import { updateUser } from "../../service/admin/endpoint.admin"
type User = {
    id: number;
    name: string;
    email: string;
    photo: string;
    role: string;
};

export default function AdminCarScreen({ navigation }: any) {
    const { user, logout } = useAuthStore();
    const queryClient = useQueryClient();
    const { data: getUser, isLoading } = useQuery<User[]>({
        queryKey: ["getUser"],
        queryFn: getAllUser,
    });

    const handleDelete = (UserId: number) => {
        RemoveUser.mutate(UserId)
        console.log("Delete user:", UserId);
    };
    const RemoveUser = useMutation({
        mutationFn: removeUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getAllUser"] })
    })

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b7bec" />
                <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
            </View>
        );
    }
    const UpddateUser = useMutation({
        mutationFn: updateUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["updateUser"] })
    })
    const updaate = (id: number) => {
        UpddateUser.mutate(id)
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Users size={28} color="#4b7bec" />
                    <Text style={styles.title}>Gestion Utilisateurs</Text>
                </View>
                <View style={styles.statsCard}>
                    <Text style={styles.statsNumber}>{getUser?.length || 0}</Text>
                    <Text style={styles.statsLabel}>Utilisateurs total</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("AdminCarScreen")}>
                        <Text>add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout}>
                        <Text>logaut</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("AlertWithInput")}>
                        <Text>logaut</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                data={getUser || []}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: item.photo }} style={styles.avatar} />
                            <View style={[
                                styles.roleBadge,
                                item.role === 'admin' && styles.adminBadge
                            ]}>
                                <Shield size={10} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>

                            <View style={styles.emailRow}>
                                <Mail size={14} color="#666" />
                                <Text style={styles.email}>{item.email}</Text>
                            </View>
                            <View style={styles.roleTag}>
                                <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => console.log("Edit user", item.id)}
                            activeOpacity={0.7}
                        >
                            <UserRoundPen size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item.id)}
                            activeOpacity={0.7}
                        >
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
        </View >
    );
}

const styles = StyleSheet.create({
    editButton: {
        backgroundColor: "#4b7bec",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        shadowColor: "#4b7bec",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    container: {
        flex: 1,
        backgroundColor: "#f8f9fd",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fd",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#4b7bec",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 16,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2d3436",
        marginLeft: 12,
    },
    statsCard: {
        backgroundColor: "#f0f5ff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#4b7bec20",
    },
    statsNumber: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#4b7bec",
    },
    statsLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    avatarContainer: {
        position: "relative",
        marginRight: 14,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        borderColor: "#f0f5ff",
    },
    roleBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#4b7bec",
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    adminBadge: {
        backgroundColor: "#ff6b6b",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: "700",
        color: "#2d3436",
        marginBottom: 6,
    },
    emailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    email: {
        fontSize: 13,
        color: "#636e72",
        marginLeft: 6,
    },
    roleTag: {
        alignSelf: "flex-start",
        backgroundColor: "#e8f4fd",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#4b7bec40",
    },
    roleText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#4b7bec",
        letterSpacing: 0.5,
    },
    deleteButton: {
        backgroundColor: "#ff6b6b",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#ff6b6b",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 16,
    },
});