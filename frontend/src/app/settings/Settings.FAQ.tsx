import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react-native";
import { router } from "expo-router";
import { getFAQ } from "../../service/settings/endpoint.Settings";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    isActive?: boolean;
}

export default function SettingsFAQ() {
    const { t } = useTranslation();
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
        <View className="flex-1 items-center justify-center px-5">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-[#64748B] text-base mt-4" style={{ fontFamily: "Lexend_500Medium" }}>{t('settings.loadingFaq')}</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center px-8">
            <View className="w-[72px] h-[72px] rounded-[20px] bg-[#64748B]/10 items-center justify-center mb-5">
                <HelpCircle color="#64748B" size={40} />
            </View>
            <Text className="text-[#E8EAED] text-lg mb-2" style={{ fontFamily: "Lexend_700Bold" }}>{t('settings.noFaqs')}</Text>
            <Text className="text-[#64748B] text-sm text-center leading-[22px]" style={{ fontFamily: "Lexend_400Regular" }}>
                {t('settings.faqAppearSoon')}
            </Text>
        </View>
    );

    const renderFAQItem = ({ item }: { item: FAQItem }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                className={["bg-[#1C1F26] rounded-2xl border border-blue-500/10 mb-3 overflow-hidden py-4 px-4", isExpanded ? "border-blue-500/30 bg-blue-500/[0.02]" : ""].join(" ")}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                        <Text className="text-[#E8EAED] text-base leading-6" style={{ fontFamily: "Lexend_600SemiBold" }} numberOfLines={2}>
                            {item.question}
                        </Text>
                    </View>
                    <View 
                        className={["w-9 h-9 rounded-lg bg-blue-500/10 items-center justify-center", isExpanded ? "bg-blue-500/20" : ""].join(" ")}
                        style={isExpanded ? { transform: [{ rotate: "180deg" }] } : undefined}
                    >
                        <ChevronDown color="#3B82F6" size={24} />
                    </View>
                </View>

                {isExpanded && (
                    <View className="mt-4 pt-4 border-t border-white/5">
                        <Text className="text-[#B0BAC9] text-sm leading-[22px]" style={{ fontFamily: "Lexend_400Regular" }}>
                            {item.answer}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0B0E14]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/5">
                <TouchableOpacity
                    className="w-[42px] h-[42px] rounded-xl bg-white/5 border border-white/8 items-center justify-center"
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-xl tracking-[0.3px] flex-1 text-center" style={{ fontFamily: "Lexend_700Bold" }}>{t('settings.faq')}</Text>
                <View style={{ width: 42 }} />
            </View>

            {/* Content */}
            {isLoading ? (
                renderLoadingState()
            ) : faqs.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <View className="px-5 py-5 bg-blue-500/[0.05] border-b border-blue-500/10">
                        <Text className="text-[#B0BAC9] text-sm mb-2" style={{ fontFamily: "Lexend_400Regular" }}>
                            {t('settings.faqFindAnswers')}
                        </Text>
                        <Text className="text-[#3B82F6] text-[13px]" style={{ fontFamily: "Lexend_600SemiBold" }}>
                            {faqs.length} {faqs.length === 1 ? t('settings.faqQuestion') : t('settings.faqQuestions')}
                        </Text>
                    </View>
                    <FlatList
                        data={faqs}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderFAQItem}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 }}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
        </SafeAreaView>
    );
}