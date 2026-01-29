import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SocketService from "../../service/SocketService";
import { Socket } from "socket.io-client";

export default function NotificationsScreen() {
    const socketRef = useRef<Socket | null>(null);
    const [notifications] = useState<any[]>([]);
    const userId = 2;

    useEffect(() => {
        const socketInstance = SocketService.getInstance().getSocket();
        socketRef.current = socketInstance;

        socketInstance.on("new_notification", (data) => {
            console.log("📩 New notification:", data);
        });

        return () => {
            socketInstance.off("new_notification");
        };
    }, []);

    const sendTest = () => {
        socketRef.current?.emit("send_test_notification", userId);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
            <TouchableOpacity onPress={sendTest}>
                <Text style={{ color: "white", marginBottom: 20 }}>
                    Send test notification
                </Text>
            </TouchableOpacity>

            {notifications.map((n) => (
                <Text key={n.id} style={{ color: "white" }}>
                    {n.text}
                </Text>
            ))}
        </View>
    );
}
