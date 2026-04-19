import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, I18nManager } from "react-native";
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('common.language')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.list}>
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <TouchableOpacity 
              key={lang.code}
              style={[styles.languageItem, isActive && styles.activeItem]}
              onPress={() => changeLanguage(lang)}
            >
              <Text style={[styles.langText, isActive && styles.activeText]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080B12",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Lexend_700Bold",
  },
  list: {
    padding: 20,
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#1C1F26",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  activeItem: {
    borderColor: "#3B82F6",
    backgroundColor: "rgba(59,130,246,0.05)",
  },
  langText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Lexend_500Medium",
  },
  activeText: {
    color: "#3B82F6",
    fontFamily: "Lexend_700Bold",
  }
});
