import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Settings, ChevronDown, HelpCircle, User, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { getFAQ } from "../../service/settings/endpoint.Settings";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    isActive?: boolean;
}

export default function SettingsScreen() {
    const { data: FAQ, isLoading } = useQuery({
        queryKey: ["getFAQ"],
        queryFn: getFAQ
    });

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const faqs: FAQItem[] = FAQ?.faqs || [];

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading FAQ...</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
                <HelpCircle color="#64748B" size={40} />
            </View>
            <Text style={styles.emptyTitle}>No FAQs Available</Text>
            <Text style={styles.emptyText}>
                Help and frequently asked questions will appear here
            </Text>
        </View>
    );

    const renderFAQItem = ({ item }: { item: FAQItem }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.faqCard,
                    isExpanded && styles.faqCardExpanded
                ]}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.questionContainer}>
                    <View style={styles.questionContent}>
                        <Text style={styles.questionText} numberOfLines={2}>
                            {item.question}
                        </Text>
                    </View>
                    <View style={[
                        styles.chevronIcon,
                        isExpanded && styles.chevronIconRotated
                    ]}>
                        <ChevronDown color="#3B82F6" size={24} />
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>
                            {item.answer}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 42 }} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Settings Sections */}
                <View style={styles.sectionsContainer}>
                    {/* Edit Profile Button */}
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={() => router.push("/EditProfileScreen")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.buttonIconWrap}>
                            <User color="#3B82F6" size={24} />
                        </View>
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonTitle}>Edit Profile</Text>
                            <Text style={styles.buttonSubtitle}>Update your profile information</Text>
                        </View>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>

                    {/* Help Button */}
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={() => {
                            // Navigate to Help screen when created
                            // router.push("/help");
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.buttonIconWrap}>
                            <HelpCircle color="#10B981" size={24} />
                        </View>
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonTitle}>Help & Support</Text>
                            <Text style={styles.buttonSubtitle}>Get help and customer support</Text>
                        </View>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>

                    {/* FAQ Button */}
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={() => router.push("/settings/Settings.FAQ")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.buttonIconWrap}>
                            <Settings color="#F59E0B" size={24} />
                        </View>
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonTitle}>FAQ</Text>
                            <Text style={styles.buttonSubtitle}>Frequently asked questions</Text>
                        </View>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0E14",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.3,
        flex: 1,
        textAlign: "center",
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 40,
    },
    sectionsContainer: {
        marginBottom: 24,
    },
    settingButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1C1F26",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 12,
    },
    buttonIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(59,130,246,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    buttonContent: {
        flex: 1,
    },
    buttonTitle: {
        color: "#E8EAED",
        fontSize: 16,
        fontFamily: "Lexend_600SemiBold",
        marginBottom: 4,
    },
    buttonSubtitle: {
        color: "#64748B",
        fontSize: 13,
        fontFamily: "Lexend_400Regular",
    },
    chevronRotated: {
        transform: [{ rotate: "90deg" }],
    },
    faqSection: {
        marginTop: 12,
    },
    faqSectionTitle: {
        color: "#E8EAED",
        fontSize: 16,
        fontFamily: "Lexend_600SemiBold",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    listContent: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        paddingBottom: 0,
    },
    faqCard: {
        backgroundColor: "#1C1F26",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(59,130,246,0.1)",
        marginBottom: 12,
        overflow: "hidden",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    faqCardExpanded: {
        borderColor: "rgba(59,130,246,0.3)",
        backgroundColor: "rgba(59, 130, 246, 0.02)",
    },
    questionContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    questionContent: {
        flex: 1,
        marginRight: 12,
    },
    questionText: {
        color: "#E8EAED",
        fontSize: 16,
        fontFamily: "Lexend_600SemiBold",
        lineHeight: 24,
    },
    chevronIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "rgba(59,130,246,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    chevronIconRotated: {
        backgroundColor: "rgba(59,130,246,0.2)",
        transform: [{ rotate: "180deg" }],
    },
    answerContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
    },
    answerText: {
        color: "#B0BAC9",
        fontSize: 14,
        fontFamily: "Lexend_400Regular",
        lineHeight: 22,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },
    loadingText: {
        color: "#64748B",
        fontSize: 16,
        fontFamily: "Lexend_500Medium",
        marginTop: 16,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
        paddingHorizontal: 32,
    },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: "rgba(100,116,139,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        color: "#E8EAED",
        fontSize: 18,
        fontFamily: "Lexend_700Bold",
        marginBottom: 8,
    },
    emptyText: {
        color: "#64748B",
        fontSize: 14,
        fontFamily: "Lexend_400Regular",
        textAlign: "center",
        lineHeight: 22,
    },
});
