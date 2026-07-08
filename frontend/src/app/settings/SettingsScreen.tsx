import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Settings, ChevronDown, HelpCircle, User, ChevronRight, Globe, Moon, Sun, Monitor } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
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

export default function SettingsScreen() {
    const { t } = useTranslation();
    const { data: FAQ, isLoading } = useQuery({
        queryKey: ["getFAQ"],
        queryFn: getFAQ
    });
    
    const { theme, setTheme } = useThemeStore();
    const [isThemeModalVisible, setThemeModalVisible] = useState(false);

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const faqs: FAQItem[] = FAQ?.faqs || [];

    const renderLoadingState = () => (
        <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-[#64748B] text-base mt-4" style={{ fontFamily: "Lexend_500Medium" }}>{t('settings.loadingFaq')}</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View className="items-center justify-center py-8 px-8">
            <View className="w-[72px] h-[72px] rounded-[20px] bg-[#64748B]/10 items-center justify-center mb-5">
                <HelpCircle color="#64748B" size={40} />
            </View>
            <Text className="text-[#E8EAED] text-lg mb-2" style={{ fontFamily: "Lexend_700Bold" }}>{t('settings.noFaqs')}</Text>
            <Text className="text-[#64748B] text-sm text-center leading-[22px]" style={{ fontFamily: "Lexend_400Regular" }}>
                {t('settings.noFaqsSubtitle')}
            </Text>
        </View>
    );

    const renderFAQItem = ({ item }: { item: FAQItem }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                className={["bg-[#18181B] rounded-2xl border border-blue-500/10 mb-3 overflow-hidden py-4 px-4", isExpanded ? "border-blue-500/30 bg-blue-500/[0.02]" : ""].join(" ")}
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/5">
                <TouchableOpacity
                    className="w-[42px] h-[42px] rounded-xl bg-white/5 border border-white/8 items-center justify-center"
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-lg tracking-[0.3px] flex-1 text-center" style={{ fontFamily: "Lexend_700Bold" }}>{t('settings.title')}</Text>
                <View style={{ width: 42 }} />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-6">
                    <TouchableOpacity
                        className="flex-row items-center bg-[#18181B] rounded-2xl border border-white/5 px-4 py-4 mb-3"
                        onPress={() => setThemeModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <View className="w-12 h-12 rounded-xl bg-[#EC4899]/10 items-center justify-center mr-4">
                            <Moon color="#EC4899" size={24} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#E8EAED] text-base mb-1" style={{ fontFamily: "Lexend_600SemiBold" }}>Appearance</Text>
                            <Text className="text-[#64748B] text-[13px]" style={{ fontFamily: "Lexend_400Regular" }}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</Text>
                        </View>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-[#18181B] rounded-2xl border border-white/5 px-4 py-4 mb-3"
                        onPress={() => {
                            // Navigate to Help screen when created
                            // router.push("/help");
                        }}
                        activeOpacity={0.7}
                    >
                        <View className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 items-center justify-center mr-4">
                            <HelpCircle color="#10B981" size={24} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#E8EAED] text-base mb-1" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('settings.helpSupport')}</Text>
                            <Text className="text-[#64748B] text-[13px]" style={{ fontFamily: "Lexend_400Regular" }}>{t('settings.helpSupportSubtitle')}</Text>
                        </View>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-[#18181B] rounded-2xl border border-white/5 px-4 py-4 mb-3"
                        onPress={() => router.push("/settings/Settings.FAQ")}
                        activeOpacity={0.7}
                    >
                        <View className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 items-center justify-center mr-4">
                            <Settings color="#F59E0B" size={24} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#E8EAED] text-base mb-1" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('settings.faq')}</Text>
                            <Text className="text-[#64748B] text-[13px]" style={{ fontFamily: "Lexend_400Regular" }}>{t('settings.faqSubtitle')}</Text>
                        </View>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-[#18181B] rounded-2xl border border-white/5 px-4 py-4 mb-3"
                        onPress={() => router.push("/LanguageSettings")}
                        activeOpacity={0.7}
                    >
                        <View className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 items-center justify-center mr-4">
                            <Globe color="#8B5CF6" size={24} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#E8EAED] text-base mb-1" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('settings.language')}</Text>
                            <Text className="text-[#64748B] text-[13px]" style={{ fontFamily: "Lexend_400Regular" }}>{t('settings.languageSubtitle')}</Text>
                        </View>
                        <ChevronRight color="#64748B" size={20} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Theme Bottom Sheet Modal */}
            <Modal
                visible={isThemeModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setThemeModalVisible(false)}>
                    <View className="flex-1 justify-end bg-black/60">
                        <TouchableWithoutFeedback>
                            <View className="bg-[#18181B] rounded-t-3xl pt-6 pb-12 px-6 border-t border-white/10">
                                <View className="items-center mb-6">
                                    <View className="w-12 h-1 bg-[#3f3f46] rounded-full mb-4" />
                                    <Text className="text-white text-xl" style={{ fontFamily: "Lexend_700Bold" }}>Choose Theme</Text>
                                </View>

                                <TouchableOpacity 
                                    className={`flex-row items-center py-4 px-4 rounded-xl mb-2 ${theme === 'light' ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30' : 'bg-white/5 border border-transparent'}`}
                                    onPress={() => { setTheme('light'); setThemeModalVisible(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Sun color={theme === 'light' ? '#3B82F6' : '#64748B'} size={24} />
                                    <Text className={`flex-1 ml-4 text-base ${theme === 'light' ? 'text-[#3B82F6]' : 'text-[#E8EAED]'}`} style={{ fontFamily: "Lexend_500Medium" }}>Light</Text>
                                    {theme === 'light' && <View className="w-2 h-2 rounded-full bg-[#3B82F6]" />}
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    className={`flex-row items-center py-4 px-4 rounded-xl mb-2 ${theme === 'dark' ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30' : 'bg-white/5 border border-transparent'}`}
                                    onPress={() => { setTheme('dark'); setThemeModalVisible(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Moon color={theme === 'dark' ? '#3B82F6' : '#64748B'} size={24} />
                                    <Text className={`flex-1 ml-4 text-base ${theme === 'dark' ? 'text-[#3B82F6]' : 'text-[#E8EAED]'}`} style={{ fontFamily: "Lexend_500Medium" }}>Dark</Text>
                                    {theme === 'dark' && <View className="w-2 h-2 rounded-full bg-[#3B82F6]" />}
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    className={`flex-row items-center py-4 px-4 rounded-xl ${theme === 'system' ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30' : 'bg-white/5 border border-transparent'}`}
                                    onPress={() => { setTheme('system'); setThemeModalVisible(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Monitor color={theme === 'system' ? '#3B82F6' : '#64748B'} size={24} />
                                    <Text className={`flex-1 ml-4 text-base ${theme === 'system' ? 'text-[#3B82F6]' : 'text-[#E8EAED]'}`} style={{ fontFamily: "Lexend_500Medium" }}>System Default</Text>
                                    {theme === 'system' && <View className="w-2 h-2 rounded-full bg-[#3B82F6]" />}
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}
