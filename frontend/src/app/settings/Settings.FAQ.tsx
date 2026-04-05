import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react-native";
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

export default function SettingsFAQ() {
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
                Frequently asked questions will appear here soon
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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>FAQ</Text>
                <View style={{ width: 42 }} />
            </View>

            {/* Content */}
            {isLoading ? (
                renderLoadingState()
            ) : faqs.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerSubtitle}>
                            Find answers to common questions
                        </Text>
                        <Text style={styles.faqCountText}>
                            {faqs.length} {faqs.length === 1 ? "question" : "questions"}
                        </Text>
                    </View>
                    <FlatList
                        data={faqs}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderFAQItem}
                        contentContainerStyle={styles.listContent}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
        </View>
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
        fontSize: 20,
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
    headerInfo: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: "rgba(59,130,246,0.05)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(59,130,246,0.1)",
    },
    headerSubtitle: {
        color: "#B0BAC9",
        fontSize: 14,
        fontFamily: "Lexend_400Regular",
        marginBottom: 8,
    },
    faqCountText: {
        color: "#3B82F6",
        fontSize: 13,
        fontFamily: "Lexend_600SemiBold",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 40,
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
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    loadingText: {
        color: "#64748B",
        fontSize: 16,
        fontFamily: "Lexend_500Medium",
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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