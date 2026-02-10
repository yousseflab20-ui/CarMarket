import { View, Text, StyleSheet, Animated, ScrollView } from "react-native";
import { useEffect, useState, useRef } from "react";
import SocketService from "../service/SocketService";

type LiveNotification = {
    id: number;
    text: string;
    createdAt?: string;
};

const userId = 2;

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<LiveNotification[]>([]);
    const [currentNotification, setCurrentNotification] = useState<LiveNotification | null>(null);

    const slideAnim = useRef(new Animated.Value(-60)).current;

    useEffect(() => {
        const socket = SocketService.getInstance().getSocket();

        socket.emit("user_online", userId);

        socket.on("new_notification", (data: LiveNotification) => {
            console.log("LIVE notification:", data);

            setNotifications(prev => [data, ...prev]);
            setCurrentNotification(data);

            Animated.timing(slideAnim, {
                toValue: 10,
                duration: 300,
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: -60,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setCurrentNotification(null);
                });
            }, 3000);
        });

        return () => {
            socket.off("new_notification");
        };
    }, []);

    return (
        <View style={styles.container}>
            {currentNotification && (
                <Animated.View style={[styles.topBar, { transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.topBarText}>{currentNotification.text}</Text>
                </Animated.View>
            )}

            <ScrollView style={{ marginTop: 20 }}>
                {notifications.length === 0 ? (
                    <Text style={styles.emptyText}>No notifications yet</Text>
                ) : (
                    notifications.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <Text style={styles.text}>{item.text}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14",
        padding: 20,
    },
    emptyText: {
        color: "#64748B",
        textAlign: "center",
        marginTop: 20,
    },
    card: {
        backgroundColor: "#1C1F26",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
    },
    text: {
        color: "#fff",
    },
    topBar: {
        position: "absolute",
        alignSelf: "center",
        backgroundColor: "#2563EB",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        zIndex: 999,
        elevation: 10,
    },
    topBarText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
});