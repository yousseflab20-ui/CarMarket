import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Settings } from "lucide-react-native";
import { router } from "expo-router";

export default function SettingsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 42 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.placeholderCard}>
                    <View style={styles.iconWrap}>
                        <Settings size={28} color="#64748B" />
                    </View>
                    <Text style={styles.placeholderTitle}>Preferences</Text>
                    <Text style={styles.placeholderText}>
                        Add language, notifications, and account options here.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },
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
        letterSpacing: 0.5,
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
    scrollContent: { paddingBottom: 48, paddingHorizontal: 20 },
    placeholderCard: {
        backgroundColor: "#1C1F26",
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(100,116,139,0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    placeholderTitle: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Lexend_700Bold",
        marginBottom: 8,
    },
    placeholderText: {
        color: "#64748B",
        fontSize: 14,
        fontFamily: "Lexend_400Regular",
        textAlign: "center",
        lineHeight: 22,
    },
});
