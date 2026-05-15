import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { OnboardingStore } from "../types/store/onboarding";

export const useOnboardingStore =
  create<OnboardingStore>((set) => ({
    hasCompletedOnboarding: false,
    isLoading: true,

    setHasCompletedOnboarding: async (
      value: boolean
    ) => {
      set({
        hasCompletedOnboarding: value,
      });

      await AsyncStorage.setItem(
        "hasCompletedOnboarding",
        JSON.stringify(value)
      );
    },

    loadOnboardingStatus: async () => {
      try {
        const value = await AsyncStorage.getItem(
          "hasCompletedOnboarding"
        );

        if (value !== null) {
          set({
            hasCompletedOnboarding:
              JSON.parse(value),
          });
        }
      } catch (error) {
        console.log(
          "Error loading onboarding status:",
          error
        );
      } finally {
        set({ isLoading: false });
      }
    },
  }));