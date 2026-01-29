import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SocketService from "../service/SocketService";

const socket = io("http://10.0.2.2:5000");
const userId = 2;
type LiveNotification = {
    id: number;
    text: string;
    createdAt?: string;
};
export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<LiveNotification[]>([]);

    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();
        socket.emit("user_online", userId);

        const handleNotification = (data: LiveNotification) => {
            console.log("LIVE notification:", data);
            setNotifications((prev) => [data, ...prev]);
        };

        socket.on("new_notification", handleNotification);

        return () => {
            socket.off("new_notification", handleNotification);
        };
    }, []);

    return (
        <View style={styles.container}>
            {notifications.length === 0 ? (
                <Text style={styles.emptyText}>No notifications yet</Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.text}>{item.text}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14", padding: 20 },
    emptyText: { color: "#64748B", textAlign: "center", marginTop: 20 },
    card: { backgroundColor: "#1C1F26", padding: 14, borderRadius: 10, marginBottom: 10 },
    text: { color: "#fff" },
});
