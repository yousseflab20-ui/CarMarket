import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';

const LANGUAGE_KEY = 'settings.lang';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  detect: async function (callback: (lang: string) => void) {
    try {
      // 1. Check if user selected a language manually
      const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLang) {
        return callback(storedLang);
      }
      
      // 2. Otherwise detect device locale
      const phoneLang = Localization.getLocales()[0].languageCode;
      if (phoneLang && ['en', 'fr', 'ar'].includes(phoneLang)) {
        return callback(phoneLang);
      }
      
      // Fallback
      return callback('en');
    } catch (error) {
      console.log('Error reading language', error);
      callback('en');
    }
  },
  cacheUserLanguage: async function (language: string) {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error caching language', error);
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    interpolation: {
      escapeValue: false, // React Native already escapes strings
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;
