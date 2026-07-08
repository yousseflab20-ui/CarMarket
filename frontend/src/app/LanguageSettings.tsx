import React, { useState } from "react";
import { View, Text, TouchableOpacity, I18nManager, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import * as Updates from 'expo-updates';
import { useThemeStore } from "../store/themeStore";

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
  const theme = useThemeStore((state: any) => state.theme);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const C = {
    bg: isDark ? "#080B12" : "#F8FAFC",
    surface: isDark ? "#18181B" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
    white: isDark ? "#FFFFFF" : "#0F172A",
    muted: isDark ? "#94A3B8" : "#64748B",
    blue: "#3B82F6",
  };

  const changeLanguage = async (lang: Language) => {
    setCurrentLang(lang.code);
    await i18n.changeLanguage(lang.code);
    const isCurrentlyRTL = I18nManager.isRTL;
    if (lang.isRTL !== isCurrentlyRTL) {
      I18nManager.allowRTL(lang.isRTL);
      I18nManager.forceRTL(lang.isRTL);
      Updates.reloadAsync();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        className="flex-row items-center justify-between p-5"
        style={{ borderBottomWidth: 1, borderBottomColor: C.border }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl items-center justify-center border"
          style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderColor: C.border }}
        >
          <ArrowLeft size={20} color={C.white} />
        </TouchableOpacity>
        <Text className="text-lg" style={{ color: C.white, fontFamily: "Lexend_700Bold" }}>
          {t('common.language')}
        </Text>
        <View className="w-10" />
      </View>

      <View className="p-5 gap-3">
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              className="flex-row justify-between items-center p-4 rounded-2xl"
              style={{
                backgroundColor: isActive
                  ? "rgba(59,130,246,0.07)"
                  : C.surface,
                borderWidth: 1,
                borderColor: isActive ? C.blue : C.border,
              }}
              onPress={() => changeLanguage(lang)}
            >
              <Text
                className="text-base"
                style={{
                  color: isActive ? C.blue : C.white,
                  fontFamily: isActive ? "Lexend_700Bold" : "Lexend_500Medium",
                }}
              >
                {lang.name}
              </Text>
              {isActive && <Check size={20} color={C.blue} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
