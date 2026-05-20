import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, I18nManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import * as Updates from 'expo-updates';

interface Language {
  code: string;
  name: string;
  isRTL: boolean;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', isRTL: false },
  { code: 'ar', name: 'العربية (Arabic)', isRTL: true },
  { code: 'fr', name: 'Français (French)', isRTL: false }
];

export default function LanguageSettings() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = async (lang: Language) => {
    setCurrentLang(lang.code);
    await i18n.changeLanguage(lang.code);
    
    // Check if we need to change RTL layout direction
    const isCurrentlyRTL = I18nManager.isRTL;
    
    if (lang.isRTL !== isCurrentlyRTL) {
        I18nManager.allowRTL(lang.isRTL);
        I18nManager.forceRTL(lang.isRTL);
        // We must reload the app for RTL direction changes to take effect natively
        Updates.reloadAsync();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#080B12" }}>
      <View className="flex-row items-center justify-between p-5 border-b border-white/[0.05]">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-xl bg-white/[0.05] items-center justify-center">
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-lg" style={{ fontFamily: "Lexend_700Bold" }}>{t('common.language')}</Text>
        <View className="w-10" />
      </View>

      <View className="p-5 gap-3">
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <TouchableOpacity 
              key={lang.code}
              className={["flex-row justify-between items-center p-4 rounded-2xl bg-[#18181B] border border-white/[0.05]", isActive ? "border-[#3B82F6] bg-[#3B82F6]/5" : ""].join(" ")}
              onPress={() => changeLanguage(lang)}
            >
              <Text 
                className={[isActive ? "text-[#3B82F6]" : "text-white", "text-base"].join(" ")}
                style={{ fontFamily: isActive ? "Lexend_700Bold" : "Lexend_500Medium" }}
              >
                {lang.name}
              </Text>
              {isActive && <Check size={20} color="#3B82F6" />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

